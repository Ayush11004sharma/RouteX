import axios from 'axios';
import { Coordinate, RouteResult, StandardRoute, TravelMode } from '../../types';
import { logger } from '../../utils/logger';

export class OsrmProvider {
  private baseUrl = 'https://router.project-osrm.org';

  public async calculateRoute(points: Coordinate[], mode: TravelMode): Promise<RouteResult> {
    if (!points || points.length < 2) {
      throw new Error('At least 2 coordinate points required for route calculation');
    }

    const coordString = points.map((p) => `${p.lng},${p.lat}`).join(';');
    const profile = mode === 'walking' ? 'foot' : mode === 'cycling' ? 'bike' : 'driving';

    let osrmData: any = null;
    let usedFallback = false;

    try {
      const url = `${this.baseUrl}/route/v1/${profile}/${coordString}?overview=full&geometries=geojson&steps=true&alternatives=true`;
      const response = await axios.get(url, { timeout: 10000 });
      if (response.data && response.data.code === 'Ok') {
        osrmData = response.data;
      } else if (profile !== 'driving') {
        usedFallback = true;
      }
    } catch (err: any) {
      if (profile !== 'driving') {
        usedFallback = true;
      } else {
        logger.error({ err: err.message }, 'OSRM primary request failed');
        throw new Error('Routing server error. Could not calculate route.');
      }
    }

    if (usedFallback || !osrmData || osrmData.code !== 'Ok') {
      try {
        const fallbackUrl = `${this.baseUrl}/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true&alternatives=true`;
        const fallbackRes = await axios.get(fallbackUrl, { timeout: 10000 });
        if (fallbackRes.data && fallbackRes.data.code === 'Ok' && fallbackRes.data.routes?.length) {
          osrmData = fallbackRes.data;
          usedFallback = true;
        } else {
          throw new Error('No route found between these locations.');
        }
      } catch (err: any) {
        throw new Error('No route found between these locations.');
      }
    }

    if (!osrmData.routes || osrmData.routes.length === 0) {
      throw new Error('No navigable route found between these points.');
    }

    const routes: StandardRoute[] = osrmData.routes.map((rawRoute: any, index: number) => {
      const geometry: [number, number][] = (rawRoute.geometry?.coordinates || []).map(
        (c: [number, number]) => [c[1], c[0]]
      );

      let distance = rawRoute.distance;
      let duration = rawRoute.duration;

      if (usedFallback) {
        if (mode === 'walking') {
          duration = Math.round((distance / 5000) * 3600);
        } else if (mode === 'cycling') {
          duration = Math.round((distance / 15000) * 3600);
        }
      }

      const legs = (rawRoute.legs || []).map((leg: any, legIdx: number) => {
        const steps = (leg.steps || []).map((step: any, stepIdx: number) => {
          const stepManeuver = step.maneuver || {};
          const stepLocation: [number, number] = stepManeuver.location
            ? [stepManeuver.location[1], stepManeuver.location[0]]
            : [0, 0];

          const instruction = this.generateInstruction(step);

          let stepDuration = step.duration;
          if (usedFallback) {
            if (mode === 'walking') stepDuration = Math.round((step.distance / 5000) * 3600);
            if (mode === 'cycling') stepDuration = Math.round((step.distance / 15000) * 3600);
          }

          return {
            id: `step-${index}-leg-${legIdx}-${stepIdx}`,
            instruction,
            distance: step.distance || 0,
            duration: stepDuration || 0,
            name: step.name || '',
            maneuver: {
              type: stepManeuver.type || 'turn',
              modifier: stepManeuver.modifier,
              location: stepLocation,
            },
          };
        });

        return {
          distance: leg.distance,
          duration: leg.duration,
          summary: leg.summary || `Leg ${legIdx + 1}`,
          steps,
        };
      });

      const allSteps = legs.flatMap((l: any) => l.steps);

      return {
        id: `route-${index}`,
        name: rawRoute.legs?.[0]?.summary
          ? `Via ${rawRoute.legs[0].summary}`
          : index === 0
          ? 'Fastest Route'
          : `Alternative ${index}`,
        distance,
        duration,
        geometry,
        summary: rawRoute.legs?.map((l: any) => l.summary).filter(Boolean).join(' → ') || '',
        weight: rawRoute.weight,
        legs,
        steps: allSteps,
        isAlternative: index > 0,
      };
    });

    return {
      route: routes[0],
      alternatives: routes.slice(1),
    };
  }

  private generateInstruction(step: any): string {
    const maneuver = step.maneuver || {};
    const type = maneuver.type;
    const modifier = maneuver.modifier ? maneuver.modifier.replace(/_/g, ' ') : '';
    const streetName = step.name ? step.name.trim() : '';
    const ref = step.ref ? ` (${step.ref})` : '';
    const target = streetName ? `${streetName}${ref}` : 'the road';

    switch (type) {
      case 'depart':
        return modifier ? `Head ${modifier} on ${target}` : `Head out on ${target}`;
      case 'arrive':
        return modifier ? `Arrive at destination on the ${modifier}` : 'Arrive at your destination';
      case 'turn':
        return modifier ? `Turn ${modifier} onto ${target}` : `Turn onto ${target}`;
      case 'continue':
      case 'new name':
        return `Continue onto ${target}`;
      case 'merge':
        return modifier ? `Merge ${modifier} onto ${target}` : `Merge onto ${target}`;
      case 'on ramp':
        return modifier ? `Take the ramp on the ${modifier} onto ${target}` : `Take the ramp onto ${target}`;
      case 'off ramp':
        return modifier ? `Take exit on the ${modifier} toward ${target}` : `Take exit toward ${target}`;
      case 'fork':
        return modifier ? `Keep ${modifier} at the fork onto ${target}` : `Keep ahead at the fork onto ${target}`;
      case 'end of road':
        return modifier ? `At the end of the road, turn ${modifier} onto ${target}` : `Turn onto ${target}`;
      case 'roundabout':
      case 'rotary': {
        const exit = maneuver.exit ? `take exit ${maneuver.exit}` : 'take your exit';
        return `At the roundabout, ${exit} onto ${target}`;
      }
      case 'u-turn':
        return `Make a U-turn on ${target}`;
      default:
        return modifier ? `${this.capitalize(type)} ${modifier} onto ${target}` : `${this.capitalize(type)} onto ${target}`;
    }
  }

  private capitalize(s: string): string {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
