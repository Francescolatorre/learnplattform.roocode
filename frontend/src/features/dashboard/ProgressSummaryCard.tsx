import React from 'react';

interface ProgressSummaryCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
}

const ProgressSummaryCard: React.FC<ProgressSummaryCardProps> = ({ title, value, icon, color }) => {
    return (
        <div style={{ border: `1px solid ${color}`, padding: '16px', borderRadius: '8px' }}>
            <h4>{title}</h4>
            <p>{value}</p>
            <i className={`icon-${icon}`} style={{ color }}></i>
        </div>
    );
};

export default ProgressSummaryCard;
