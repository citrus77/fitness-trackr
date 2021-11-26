import React from 'react';

const SingleActivity = ({ children, activity }) => {
    return activity 
        ? <div className='activity-single'>
            <span>Name: {activity.name}</span>
            <span>Description: {activity.description}</span>

            { children }
            
        </div>
        : 'Loading...'
};

export default SingleActivity;