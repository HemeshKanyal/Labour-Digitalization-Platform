import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, Filter, LogOut, Sun, Moon, Palette, Phone, Mail, Video, MessageCircle, Star, User as UserIcon, MapPin } from 'lucide-react';
import { WorkerProfile } from './WorkerProfile';
import { CustomerProfile } from './CustomerProfile';
import { LocationSearch } from './LocationSearch';
import { ChatWindow } from './ChatWindow';
import { ChatList } from './ChatList';

type View = 'dashboard' | 'profile' | 'messages';

type Theme = 'light' | 'dark' | 'colorful';

interface CustomerDashboardProps {
  onLogout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const workerCategories = [
  'All Workers',
  'Electricians',
  'Carpenters',
  'Plumbers',
  'Painters',
  'Masons',
  'Welders',
];

const mockWorkers = [
  { id: 1, name: 'Rajesh Kumar', category: 'Electricians', experience: 8, rating: 4.8, price: 500, location: 'Andheri, Mumbai', distance: 2.5, skills: ['Wiring', 'Repairs', 'Installation'], isVip: true },
  { id: 2, name: 'Amit Singh', category: 'Carpenters', experience: 12, rating: 4.9, price: 600, location: 'Bandra, Mumbai', distance: 5.2, skills: ['Furniture', 'Doors', 'Windows'], isVip: true },
  { id: 3, name: 'Suresh Patel', category: 'Plumbers', experience: 5, rating: 4.5, price: 400, location: 'Andheri, Mumbai', distance: 1.8, skills: ['Pipe Fitting', 'Repairs', 'Installation'], isVip: false },
  { id: 4, name: 'Vikram Sharma', category: 'Electricians', experience: 10, rating: 4.7, price: 550, location: 'Powai, Mumbai', distance: 8.3, skills: ['Panel Work', 'Wiring', 'Repairs'], isVip: true },
  { id: 5, name: 'Ramesh Yadav', category: 'Painters', experience: 6, rating: 4.6, price: 450, location: 'Kurla, Mumbai', distance: 6.7, skills: ['Interior', 'Exterior', 'Texture'], isVip: false },
  { id: 6, name: 'Dinesh Verma', category: 'Masons', experience: 15, rating: 4.9, price: 700, location: 'Andheri, Mumbai', distance: 3.1, skills: ['Brickwork', 'Plastering', 'Tiling'], isVip: true },
];

interface Worker {
  id: string | number;
  userId?: string;
  name: string;
  category: string;
  experience: number;
  rating: number;
  price: number;
  location: string;
  distance?: number;
  skills: string[];
  isVip: boolean;
}

export function CustomerDashboard({ onLogout, theme, setTheme }: CustomerDashboardProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }

        const response = await api.get('/workers');
        // Transform backend data to match UI component needs
        const transformedWorkers = response.data.map((w: any) => ({
          id: w._id,
          userId: w.user?._id,
          name: w.user?.name || 'Unknown',
          category: w.skills?.[0] || 'General', // Use first skill as category for now
          experience: Math.floor(Math.random() * 10) + 1, // Mock experience for now
          rating: w.rating || 0,
          price: w.hourlyRate || 0,
          location: w.location || 'Unknown',
          distance: Math.floor(Math.random() * 10) + 1, // Mock distance
          skills: w.skills || [],
          isVip: false // Mock VIP status
        }));
        setWorkers(transformedWorkers);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('All Workers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minExperience, setMinExperience] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [activeChatWorker, setActiveChatWorker] = useState<Worker | null>(null);
  const [pendingChatUser, setPendingChatUser] = useState<{ _id: string; name: string } | null>(null);

  const handleNavigateToChat = (user: { _id: string; name: string }) => {
    setPendingChatUser(user);
    setCurrentView('messages');
  };

  const isDark = theme === 'dark';
  const isColorful = theme === 'colorful';

  const handleLocationSelect = (lat: number, lng: number, radius: number) => {
    setMaxDistance(radius);
    setShowLocationSearch(false);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesCategory = selectedCategory === 'All Workers' || worker.category === selectedCategory;
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = worker.price >= priceRange[0] && worker.price <= priceRange[1];
    const matchesExperience = worker.experience >= minExperience;
    const matchesDistance = worker.distance <= maxDistance;
    return matchesCategory && matchesSearch && matchesPrice && matchesExperience && matchesDistance;
  }).sort((a, b) => a.distance - b.distance); // Sort by distance

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`${isDark ? 'bg-gray-800 border-gray-700' :
        isColorful ? 'bg-white/80 backdrop-blur-sm border-purple-200' :
          'bg-white border-gray-200'
        } border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-blue-600' :
                isColorful ? 'bg-gradient-to-br from-purple-500 to-blue-500' :
                  'bg-blue-500'
                } flex items-center justify-center`}>
                <span className="text-white">SM</span>
              </div>
              <span className={`${isDark ? 'text-white' :
                isColorful ? 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent' :
                  'text-gray-900'
                }`}>Customer Dashboard</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Messages Info Button - For Navigation */}
              <button
                onClick={() => setCurrentView('messages')}
                className={`p-2 rounded-lg ${currentView === 'messages'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : isColorful
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-blue-100 text-blue-600'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : isColorful
                      ? 'text-gray-600 hover:bg-purple-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Home/Dashboard Button */}
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`p-2 rounded-lg ${currentView === 'dashboard'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : isColorful
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-blue-100 text-blue-600'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : isColorful
                      ? 'text-gray-600 hover:bg-purple-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Profile Button */}
              <button
                onClick={() => setCurrentView('profile')}
                className={`p-2 rounded-lg ${currentView === 'profile'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : isColorful
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-blue-100 text-blue-600'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : isColorful
                      ? 'text-gray-600 hover:bg-purple-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <UserIcon className="w-5 h-5" />
              </button>
              {/* Theme Switcher */}
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-100 text-blue-600' :
                  isDark ? 'text-gray-400 hover:bg-gray-700' :
                    'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 text-white' :
                  isDark ? 'text-gray-400 hover:bg-gray-700' :
                    'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Moon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTheme('colorful')}
                className={`p-2 rounded-lg ${theme === 'colorful' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' :
                  isDark ? 'text-gray-400 hover:bg-gray-700' :
                    'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Palette className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:bg-gray-700' :
                  isColorful ? 'text-gray-600 hover:bg-purple-100' :
                    'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'profile' ? (
          <CustomerProfile
            theme={theme}
            user={user}
            onNavigateToChat={handleNavigateToChat}
          />
        ) : currentView === 'messages' ? (
          <ChatList
            theme={theme}
            initialChatUser={pendingChatUser}
            onClearInitialChat={() => setPendingChatUser(null)}
          />
        ) : (
          <>
            {/* Location Search */}
            {showLocationSearch && (
              <div className="mb-6">
                <LocationSearch theme={theme} onLocationSelect={handleLocationSelect} />
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="mb-8">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  <input
                    type="text"
                    placeholder="Search workers by name or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' :
                      isColorful ? 'bg-white border-purple-200 text-gray-900' :
                        'bg-white border-gray-300 text-gray-900'
                      } border`}
                  />
                </div>
                <button
                  onClick={() => setShowLocationSearch(!showLocationSearch)}
                  className={`px-6 py-3 rounded-lg flex items-center gap-2 ${showLocationSearch
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : isColorful
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-blue-500 text-white'
                    : isDark
                      ? 'bg-gray-800 text-white border-gray-700'
                      : isColorful
                        ? 'bg-white text-purple-600 border-purple-200'
                        : 'bg-white text-gray-700 border-gray-300'
                    } border`}
                >
                  <MapPin className="w-5 h-5" />
                  Nearby
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-gray-800 text-white border-gray-700' :
                    isColorful ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' :
                      'bg-blue-500 text-white'
                    } border`}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' :
                  isColorful ? 'bg-white/90 backdrop-blur-sm border-purple-200' :
                    'bg-white border-gray-200'
                  } border mb-4`}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Minimum Experience: {minExperience} years
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={minExperience}
                        onChange={(e) => setMinExperience(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              {workerCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === category
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : isColorful
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'bg-blue-500 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                      : isColorful
                        ? 'bg-white/80 text-gray-700 border border-purple-200 hover:bg-purple-50'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Workers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' :
                    isColorful ? 'bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg' :
                      'bg-white border-gray-200 shadow-md'
                    } border hover:shadow-xl transition-all cursor-pointer`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  {/* VIP Badge */}
                  {worker.isVip && (
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full mb-3 ${isDark ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' :
                      isColorful ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                        'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}>
                      <Star className="w-4 h-4" />
                      <span>VIP Member</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{worker.name}</h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{worker.category}</p>
                    </div>
                    <div className={`text-right`}>
                      <div className={`flex items-center gap-1 mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{worker.rating}</span>
                      </div>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{worker.experience} yrs</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {worker.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' :
                          isColorful ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MapPin className="w-4 h-4" />
                      {worker.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`${worker.distance <= 3 ? 'text-green-600' : worker.distance <= 7 ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                      {worker.distance}km away
                    </span>
                    <span className={`${isDark ? 'text-green-400' :
                      isColorful ? 'text-purple-600' :
                        'text-green-600'
                      }`}>₹{worker.price}/day</span>
                  </div>

                  {/* Contact Options */}
                  <div className="flex gap-2">
                    {worker.isVip ? (
                      <>
                        <button className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                          isColorful ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white' :
                            'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}>
                          <Video className="w-4 h-4" />
                          Video
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChatWorker(worker);
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-green-600 hover:bg-green-700 text-white' :
                            isColorful ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white' :
                              'bg-green-500 hover:bg-green-600 text-white'
                            }`}>
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                      </>
                    ) : (
                      <>
                        <button className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' :
                          isColorful ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' :
                            'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}>
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChatWorker(worker);
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' :
                            isColorful ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' :
                              'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}>
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredWorkers.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No workers found matching your criteria.
              </div>
            )}
          </>
        )}
      </div>

      {/* Worker Profile Modal */}
      {selectedWorker && (
        <WorkerProfile
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          theme={theme}
        />
      )}

      {/* Chat Window - Only used for legacy or specific cases if not redirecting. 
          Currently we redirect to Messages tab for all chats from cards too for consistency. 
          But keeping this if needed for other quick actions. 
          Actually, let's remove it to force consistent navigation. */}
      {/* {activeChatWorker && user && (
        <ChatWindow
          currentUserId={user._id}
          recipientId={activeChatWorker.userId || activeChatWorker.id.toString()}
          recipientName={activeChatWorker.name}
          onClose={() => setActiveChatWorker(null)}
          theme={theme}
        />
      )} */}
    </div>
  );
}