import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import apiClient from '../../api/client';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('Conference Room A');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiClient.get('/bookings');
        setBookings(response.data?.data?.bookings || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const openBookingModal = (assetName = 'Conference Room A') => {
    setSelectedAsset(assetName);
    setIsModalOpen(true);
  };

  return (
    <div className="p-container-padding flex flex-col gap-stack-lg">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Left Sidebar: Searchable Assets */}
        <aside className="xl:col-span-3 flex flex-col gap-stack-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Resources</h3>
              <Filter className="w-5 h-5 text-on-surface-variant" />
            </div>
            <div className="relative">
              <input 
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm transition-colors" 
                placeholder="Filter assets..." 
                type="text" 
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            </div>
            
            <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto custom-scrollbar">
              {/* Asset Items */}
              <div 
                className="p-3 rounded-lg bg-surface-container-high flex flex-col gap-1 cursor-pointer border border-transparent hover:border-outline-variant transition-all"
                onClick={() => openBookingModal('Conference Room A')}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-primary">Conference Room A</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">READY</span>
                </div>
                <p className="text-xs text-on-surface-variant">Lvl 4, South Wing • 12 Seats</p>
              </div>
              <div 
                className="p-3 rounded-lg hover:bg-surface-container-high flex flex-col gap-1 cursor-pointer border border-transparent transition-all"
                onClick={() => openBookingModal('Projector X2-4k')}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-primary">Projector X2-4k</span>
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">IN USE</span>
                </div>
                <p className="text-xs text-on-surface-variant">AV Storage • Portable</p>
              </div>
              <div 
                className="p-3 rounded-lg hover:bg-surface-container-high flex flex-col gap-1 cursor-pointer border border-transparent transition-all"
                onClick={() => openBookingModal('ThinkStation D40')}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-primary">ThinkStation D40</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">READY</span>
                </div>
                <p className="text-xs text-on-surface-variant">IT Dept • Mobile Workstation</p>
              </div>
            </div>
          </div>

          {/* Booking Quota Card */}
          <div className="bg-primary text-on-primary p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden">
            <div className="z-10 flex flex-col gap-2">
              <p className="text-sm font-bold">Booking Quota</p>
              <p className="text-sm opacity-80">You have used 12/20 hours this month.</p>
              <div className="w-full bg-on-primary/20 h-1.5 rounded-full mt-2">
                <div className="bg-on-primary h-full rounded-full w-[60%]"></div>
              </div>
            </div>
            <Clock className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
          </div>
        </aside>

        {/* Center: Calendar View */}
        <section className="xl:col-span-9 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">
          <header className="p-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-primary">April 2024</h2>
              <div className="flex border border-outline-variant rounded-lg overflow-hidden">
                <button className="p-2 hover:bg-surface-container-high border-r border-outline-variant transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="px-4 py-1 text-sm font-medium hover:bg-surface-container-high transition-colors">Today</button>
                <button className="p-2 hover:bg-surface-container-high border-l border-outline-variant transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex bg-surface-container-high rounded-lg p-1">
              <button className="px-4 py-1.5 text-sm font-medium bg-white rounded shadow-sm">Week</button>
              <button className="px-4 py-1.5 text-sm font-medium hover:bg-white/50 transition-colors">Month</button>
            </div>
          </header>
          
          <div className="flex flex-col h-[600px] overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-outline-variant bg-surface-container-low">
              <div className="h-10 border-r border-outline-variant"></div>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
                <div key={day} className={`h-10 flex flex-col items-center justify-center border-r border-outline-variant ${idx === 2 ? 'bg-secondary-container/20' : ''}`}>
                  <span className={`text-[10px] font-bold ${idx === 2 ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>{day}</span>
                  <span className={`text-sm ${idx === 2 ? 'text-on-secondary-container font-bold' : 'text-primary'}`}>{15 + idx}</span>
                </div>
              ))}
            </div>

            {/* Scrollable Time Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative">
                {/* Time Column */}
                <div className="flex flex-col border-r border-outline-variant/50">
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(time => (
                    <div key={time} className="h-16 flex items-start justify-center pt-2 text-xs text-on-surface-variant">
                      {time}
                    </div>
                  ))}
                </div>
                
                {/* Grid Background Lines (7 columns) */}
                <div className="col-span-7 grid grid-cols-7 relative h-[576px]">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={`border-r border-outline-variant/50 ${i === 2 ? 'bg-secondary-container/5' : ''}`}></div>
                  ))}
                  
                  {/* Rows (Absolute) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-16 border-b border-outline-variant/50"></div>
                    ))}
                  </div>

                  {/* Booking Blocks (Absolute Overlay) */}
                  {/* Monday 9-11 */}
                  <div 
                    className="absolute top-[64px] left-[0%] w-[14.28%] h-[128px] p-1 cursor-pointer z-10"
                    onClick={() => openBookingModal('Conference Room A')}
                  >
                    <div className="w-full h-full bg-secondary-container border-l-4 border-secondary text-on-secondary-container rounded p-2 overflow-hidden shadow-sm hover:brightness-95 transition-all">
                      <p className="text-[11px] leading-tight font-bold">Conf Room A</p>
                      <p className="text-[10px] opacity-80 mt-0.5">Sync Up</p>
                    </div>
                  </div>
                  
                  {/* Wednesday 10-12 (Current Day) */}
                  <div 
                    className="absolute top-[128px] left-[28.56%] w-[14.28%] h-[128px] p-1 cursor-pointer z-10"
                    onClick={() => openBookingModal('Conference Room A')}
                  >
                    <div className="w-full h-full bg-primary-container border-l-4 border-primary text-on-primary-fixed rounded p-2 overflow-hidden shadow-sm hover:brightness-110 transition-all">
                      <p className="text-[11px] leading-tight font-bold">Conf Room A</p>
                      <p className="text-[10px] opacity-80 mt-0.5">Board Meeting</p>
                    </div>
                  </div>
                  
                  {/* Clickable Area for new bookings */}
                  <div 
                    className="absolute top-0 left-0 w-full h-full z-0 cursor-crosshair" 
                    onClick={() => openBookingModal()}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* My Bookings Table */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">My Upcoming Bookings</h3>
          <button className="text-secondary text-sm font-medium hover:underline">View History</button>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-on-surface-variant">Resource</th>
                <th className="px-6 py-3 text-sm font-medium text-on-surface-variant">Date</th>
                <th className="px-6 py-3 text-sm font-medium text-on-surface-variant">Time</th>
                <th className="px-6 py-3 text-sm font-medium text-on-surface-variant">Notes</th>
                <th className="px-6 py-3 text-sm font-medium text-on-surface-variant">Status</th>
                <th className="px-6 py-3 text-sm font-medium text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {bookings.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant text-sm">
                    No upcoming bookings found. Click on the calendar to create one.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-primary">{booking.Asset?.name || 'Unknown Asset'}</td>
                    <td className="px-6 py-4 text-sm">{new Date(booking.startTime).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                      {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant italic">{booking.purpose || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight ${
                        booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:text-primary transition-colors"><Edit2 className="w-4 h-4 inline" /></button>
                      <button className="p-1 hover:text-error transition-colors ml-2"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAB */}
      <button 
        onClick={() => openBookingModal()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-surface-container-lowest border border-outline-variant w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary">Schedule Booking</h3>
              <button 
                className="text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            <form className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">Resource Name</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm appearance-none"
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                  >
                    <option>Conference Room A</option>
                    <option>Projector X2-4k</option>
                    <option>ThinkStation D40</option>
                    <option>Executive Lounge</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">Start DateTime</label>
                  <input type="datetime-local" className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">End DateTime</label>
                  <input type="datetime-local" className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">Notes / Purpose</label>
                <textarea 
                  className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm resize-none" 
                  placeholder="Reason for booking..." 
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-secondary-container/20 rounded-lg border border-secondary-container">
                <span className="text-secondary w-5 h-5">ℹ️</span>
                <p className="text-xs text-on-secondary-container">Your booking will be sent to the administrator for approval based on resource availability.</p>
              </div>
              
              <div className="flex gap-4 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-outline-variant text-on-surface text-sm font-medium rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-on-primary text-sm font-medium rounded-lg hover:brightness-110 transition-all shadow-lg"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
