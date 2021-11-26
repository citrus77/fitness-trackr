import React from 'react';

import { SingleActivity } from './'

const SingleRoutine = ({ children, routine }) => {

    return routine 
        ? <div className='routine-single'>
            <span><h3>{routine.name}</h3></span>
            <span><h3 className='creator-name'>created by {routine.creatorName}</h3></span>
            <span>Goal: {routine.goal}</span>
            <span>Public: {routine.isPublic ? 'yes': 'no' }</span>

            { children }

            {
            routine.activities.length > 0 && <div className='activities'>
                <span>Activities:</span>
                <ul className='activities-list'>
                {
                 routine.activities.map(activity => <li className='activity-single' key={activity.id}>
                     <SingleActivity activity={activity}>
                     {
                        <>
                            <span>Repetition: {activity.count} times</span>
                            <span>Duration: {activity.duration} minutes</span>
                        </>
                     }
                    </SingleActivity>
                </li>)
                }
                </ul>
            </div>
            }
        </div>
        : 'Loading...'
};

export default SingleRoutine;