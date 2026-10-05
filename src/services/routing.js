/**
 * Calculates real route between 2 or more coordinates using OSRM.
 * coordinates: array of [lat, lng]
 */
export async function getRoute(coordsOrFrom, toOrMode, modeArg, signal) {
  let coords = [];
  let mode = 'driving';
  let abortSignal = signal;

  // Handle both signatures:
  // Signature 1: getRoute([[lat, lng], [lat, lng], ...], 'driving', signal)
  // Signature 2: getRoute([fromLat, fromLng], [toLat, toLng], 'driving', signal)
  if (Array.isArray(coordsOrFrom) && Array.isArray(coordsOrFrom[0])) {
    coords = coordsOrFrom;
    if (typeof toOrMode === 'string') {
      mode = toOrMode;
    }
    abortSignal = modeArg;
  } else {
    coords = [coordsOrFrom, toOrMode];
    mode = modeArg || 'driving';
  }

  // Validate coordinates
  if (!coords || coords.length < 2) {
    throw new Error('At least 2 coordinate points required for route calculation');
  }

  for (const c of coords) {
    if (!Array.isArray(c) || isNaN(c[0]) || isNaN(c[1])) {
      throw new Error('Invalid coordinates provided for route calculation');
    }
  }

  // OSRM expects coordinates as: lng1,lat1;lng2,lat2;lng3,lat3...
  const coordString = coords.map((c) => `${c[1]},${c[0]}`).join(';');

  const profile = mode === 'walking' ? 'foot' : mode === 'cycling' ? 'bike' : 'driving';
  let osrmData = null;
  let usedFallback = false;

  try {
    const url = `https://router.project-osrm.org/route/v1/${profile}/${coordString}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    const res = await fetch(url, { signal: abortSignal });
    if (res.ok) {
      osrmData = await res.json();
    } else if (res.status === 400 && profile !== 'driving') {
      usedFallback = true;
    } else {
      const errText = await res.text();
      throw new Error(`Routing service returned error ${res.status}: ${errText.substring(0, 100)}`);
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    if (profile !== 'driving') {
      usedFallback = true;
    } else {
      throw new Error('Could not connect to routing server. Please check your internet connection.');
    }
  }

  if (usedFallback || !osrmData || osrmData.code !== 'Ok') {
    const fallbackUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    const res = await fetch(fallbackUrl, { signal: abortSignal });
    if (!res.ok) {
      throw new Error('No route found between these locations.');
    }
    osrmData = await res.json();
    if (osrmData.code !== 'Ok' || !osrmData.routes?.length) {
      throw new Error('No route found between these locations.');
    }
  }

  if (!osrmData.routes || osrmData.routes.length === 0) {
    throw new Error('No navigable route found between these points.');
  }

  const routes = osrmData.routes.map((rawRoute, index) => {
    const geometry = (rawRoute.geometry?.coordinates || []).map((coord) => [coord[1], coord[0]]);

    let distance = rawRoute.distance;
    let duration = rawRoute.duration;

    if (usedFallback) {
      if (mode === 'walking') {
        duration = Math.round((distance / 5000) * 3600);
      } else if (mode === 'cycling') {
        duration = Math.round((distance / 15000) * 3600);
      }
    }

    const legs = (rawRoute.legs || []).map((leg, legIdx) => {
      const steps = (leg.steps || []).map((step, stepIdx) => {
        const stepManeuver = step.maneuver || {};
        const stepLocation = stepManeuver.location
          ? [stepManeuver.location[1], stepManeuver.location[0]]
          : [0, 0];

        const instruction = generateInstruction(step, mode);

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

    const allSteps = legs.flatMap((l) => l.steps);

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
      summary: rawRoute.legs?.map((l) => l.summary).filter(Boolean).join(' → ') || '',
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

function generateInstruction(step, _mode) {
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
    case 'rotary':
      const exit = maneuver.exit ? `take exit ${maneuver.exit}` : 'take your exit';
      return `At the roundabout, ${exit} onto ${target}`;
    case 'u-turn':
      return `Make a U-turn on ${target}`;
    default:
      return modifier ? `${capitalize(type)} ${modifier} onto ${target}` : `${capitalize(type)} onto ${target}`;
  }
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
