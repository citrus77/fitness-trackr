import React from 'react';

import { SingleRoutine } from './'

const Routines = ({ publicRoutines }) => {
    return publicRoutines
        ? <>
            <div className='routines'>
                <span>Routines:</span>
                {
                publicRoutines.map(routine => <SingleRoutine key={routine.id} routine={routine} />)
                }
            </div>
        </>
        : 'Loading...'
};

export default Routines;