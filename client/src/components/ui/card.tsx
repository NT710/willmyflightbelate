// card.tsx
import React from 'react';
import type { FC } from 'react';
import './card.css'; // Assuming CSS for styling is present

type CardProps = {
  title: string;
  content: string;
};

const Card: FC<CardProps> = ({ title, content }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Card;
