const flightUpdateReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      const flights = action.data.map((flight) => {
        return { ...flight, updatedAt: null };
      })

      return [ ...flights ];
    case 'CREATE':
      return [ ...state, action.data ];
    case 'UPDATE':
      return state.map((flight) => {
        if (flight.flightId === action.data.flightId) {
          return action.data;
        }
        return flight;
      });
    default:
      return state;
  }
};

export default flightUpdateReducer;