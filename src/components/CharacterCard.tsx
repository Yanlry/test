import React from 'react';
import { Sword, Shield, Heart } from 'lucide-react';

type CharacterProps = {
  name: string;
  level: number;
  health: number;
  attack: number;
  defense: number;
  avatarUrl?: string;
};

const CharacterCard: React.FC<CharacterProps> = ({
  name,
  level,
  health,
  attack,
  defense,
  avatarUrl,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300">
      <img
        src={avatarUrl || '/assets/images/default-avatar.png'}
        alt={`${name}'s avatar`}
        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
      />
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-500">Level {level}</p>

        <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            {health}
          </div>
          <div className="flex items-center gap-1">
            <Sword className="w-4 h-4 text-blue-500" />
            {attack}
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-500" />
            {defense}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
