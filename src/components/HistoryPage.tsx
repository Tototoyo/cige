/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {HistoryItem, VideoType} from '../types';
import {clearHistory, deleteFromHistory, getHistory} from '../utils/history';
import {
  ArrowDownTrayIcon,
  BookOpenIcon,
  ClockIcon,
  CubeTransparentIcon,
  FilmIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
  Bars3BottomLeftIcon,
} from './icons';

interface HistoryPageProps {
  onLoadItem: (item: HistoryItem) => void;
  onSwitchToCreator: () => void;
}

const TypeIcon: React.FC<{type: VideoType; className?: string}> = ({
  type,
  className,
}) => {
  const icons: {[key in VideoType]: React.FC<any>} = {
    storyboard: VideoCameraIcon,
    logo: CubeTransparentIcon,
    introOutro: FilmIcon,
    explainer: BookOpenIcon,
    kinetic: Bars3BottomLeftIcon,
    musicVideo: FilmIcon, // Placeholder
    cashCow: FilmIcon, // Placeholder
  };
  const Icon = icons[type] || FilmIcon;
  return <Icon className={className} />;
};

const HistoryCard: React.FC<{
  item: HistoryItem;
  onDelete: (id: string) => void;
  onLoad: (item: HistoryItem) => void;
}> = ({item, onDelete, onLoad}) => {
  const firstVisual = item.visuals?.find((v) => v !== null);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden flex flex-col transition-shadow hover:shadow-lg hover:shadow-purple-500/10">
      <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
        {firstVisual ? (
          <img
            src={`data:image/jpeg;base64,${firstVisual}`}
            alt={`Preview for ${item.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <PhotoIcon className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5 capitalize">
          <TypeIcon type={item.type} className="w-4 h-4" />
          <span>{item.type === 'introOutro' ? 'Intro/Outro' : item.type}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-white truncate" title={item.title}>
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 mb-3">
          <ClockIcon className="w-4 h-4" />
          <span>{new Date(item.timestamp).toLocaleString()}</span>
        </div>
        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onLoad(item)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
            <ArrowDownTrayIcon className="w-5 h-5" />
            Load
          </button>
          <button
            onClick={() => onDelete(item.id)}
            aria-label={`Delete item ${item.title}`}
            className="p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-red-600/50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onLoadItem,
  onSwitchToCreator,
}) => {
  const {user} = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      setHistory(getHistory(user.email));
    } else {
      setHistory([]); // Clear history visually if user logs out
    }
  }, [user]);

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('Are you sure you want to delete this item?')) {
        deleteFromHistory(id, user?.email);
        setHistory(getHistory(user?.email));
      }
    },
    [user],
  );

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all generation history? This cannot be undone.',
      )
    ) {
      clearHistory(user?.email);
      setHistory([]);
    }
  };

  const handleLoad = useCallback(
    (item: HistoryItem) => {
      onLoadItem(item);
    },
    [onLoadItem],
  );

  if (!user) {
    return (
      <div className="w-full max-w-7xl py-10 px-4">
        <div className="text-center py-20 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-700">
          <BookOpenIcon className="mx-auto w-16 h-16 text-gray-600" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            Please Sign In to View Your History
          </h3>
          <p className="mt-2 text-gray-400">
            Your generated prompts and creations are saved to your account.
          </p>
          <button
            onClick={onSwitchToCreator}
            className="mt-6 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
            Back to Creator Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl py-10 px-4">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-purple-400" />
            Generation History
          </h2>
          <p className="text-gray-400 mt-1">
            Revisit, reload, and continue your past creations.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/40 transition-colors">
            <TrashIcon className="w-5 h-5" />
            Clear All History
          </button>
        )}
      </header>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {history.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onLoad={handleLoad}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-700">
          <BookOpenIcon className="mx-auto w-16 h-16 text-gray-600" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            No History Found
          </h3>
          <p className="mt-2 text-gray-400">
            Your generated prompts will appear here once you create them.
          </p>
          <button
            onClick={onSwitchToCreator}
            className="mt-6 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
            Start Creating
          </button>
        </div>
      )}
    </div>
  );
};
