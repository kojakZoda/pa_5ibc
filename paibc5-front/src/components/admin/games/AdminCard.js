import React from 'react';


const AdminCard = ({ number, suit }) => {
    const combo = (number) ? `${number}${suit}` : null;
    const color = (suit === '♦' || suit === '♥') ? 'card-red' : 'card';

    return (
        <td>
            <div className={color}>
                {combo}
            </div>
        </td>
    );
};

export default AdminCard;