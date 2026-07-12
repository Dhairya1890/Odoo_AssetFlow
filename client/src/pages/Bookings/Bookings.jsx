import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Bookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [bookableAssets, setBookableAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    assetId: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [bookingsRes, assetsRes] = await Promise.all([
        apiClient.get('/bookings'),
        apiClient.get('/assets')
      ]);
      setBookings(bookingsRes.data?.data?.bookings || []);
      const allAssets = assetsRes.data?.data?.assets || [];
      const bookable = allAssets.filter(a => a.isBookable);
      setBookableAssets(bookable);
      
      if (!formData.assetId && bookable.length > 0) {
        setFormData(prev => ({ ...prev, assetId: bookable[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.openModal && !loading && bookableAssets.length > 0) {
      openBookingModal();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, loading, bookableAssets, navigate]);

  const openBookingModal = (assetId = '', bookingToEdit = null) => {
    if (bookingToEdit) {
      setEditingId(bookingToEdit.id);
      // Format to YYYY-MM-DDTHH:mm
      const formatTime = (isoString) => new Date(isoString).toISOString().slice(0, 16);
      setFormData({
        assetId: bookingToEdit.assetId,
        startTime: formatTime(bookingToEdit.startTime),
        endTime: formatTime(bookingToEdit.endTime),
        notes: bookingToEdit.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({ 
        assetId: assetId || (bookableAssets[0]?.id || ''), 
        startTime: '', 
        endTime: '', 
        notes: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.patch(`/bookings/${editingId}/reschedule`, {
          startTime: formData.startTime,
          endTime: formData.endTime
        });
        toast.success('Booking rescheduled successfully!');
      } else {
        await apiClient.post('/bookings', formData);
        toast.success('Booking request submitted!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save booking');
    }
  };

  const handleCancel = async (id) => {
    try {
      await apiClient.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // Calculations for UI
  const myBookings = bookings.filter(b => b.userId === user?.id);
  const myUpcoming = myBookings.filter(b => b.status === 'upcoming' || b.status === 'APPROVED');
  
  const usedHours = myUpcoming.reduce((acc, curr) => {
    const diff = new Date(curr.endTime) - new Date(curr.startTime);
    return acc + (diff / (1000 * 60 * 60));
  }, 0).toFixed(1);
  const quotaPercent = Math.min((usedHours / 20) * 100, 100);

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
              {bookableAssets.length === 0 ? (
                <p className="text-xs text-on-surface-variant p-2">No bookable resources found.</p>
              ) : bookableAssets.map(asset => (
                <div 
                  key={asset.id}
                  className="p-3 rounded-lg hover:bg-surface-container-high flex flex-col gap-1 cursor-pointer border border-transparent hover:border-outline-variant transition-all"
                  onClick={() => openBookingModal(asset.id)}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-primary">{asset.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      asset.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {asset.status === 'available' ? 'READY' : 'IN USE'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{asset.department?.name || 'Shared'} • {asset.category?.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Quota Card */}
          <div className="bg-primary text-on-primary p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden">
            <div className="z-10 flex flex-col gap-2">
              <p className="text-sm font-bold">Booking Quota</p>
              <p className="text-sm opacity-80">You have used {usedHours}/20 hours this month.</p>
              <div className="w-full bg-on-primary/20 h-1.5 rounded-full mt-2">
                <div className="bg-on-primary h-full rounded-full transition-all" style={{ width: `${quotaPercent}%` }}></div>
              </div>
            </div>
            <Clock className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
          </div>
        </aside>

        {/* Center: Calendar View */}
        <section className="xl:col-span-9 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">
          <header className="p-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-primary">Calendar View</h2>
            </div>
          </header>
          
          <div className="flex flex-col h-[600px] overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-outline-variant bg-surface-container-low">
              <div className="h-10 border-r border-outline-variant"></div>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => {
                const today = new Date();
                const currentDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
                const isToday = idx === currentDayIdx;
                
                // Calculate date for the week
                const date = new Date(today);
                date.setDate(today.getDate() - currentDayIdx + idx);
                
                return (
                  <div key={day} className={`h-10 flex flex-col items-center justify-center border-r border-outline-variant ${isToday ? 'bg-secondary-container/20' : ''}`}>
                    <span className={`text-[10px] font-bold ${isToday ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>{day}</span>
                    <span className={`text-sm ${isToday ? 'text-on-secondary-container font-bold' : 'text-primary'}`}>{date.getDate()}</span>
                  </div>
                );
              })}
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
                    <div key={i} className="border-r border-outline-variant/50"></div>
                  ))}
                  
                  {/* Rows (Absolute) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-16 border-b border-outline-variant/50"></div>
                    ))}
                  </div>

                  {/* Dynamic Bookings Overlay */}
                  {bookings.filter(b => b.status !== 'cancelled').map(booking => {
                    const start = new Date(booking.startTime);
                    const end = new Date(booking.endTime);
                    
                    const dayIdx = start.getDay() === 0 ? 6 : start.getDay() - 1;
                    const left = dayIdx * 14.28;
                    
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;
                    
                    if (startHour < 8 || startHour > 17) return null;
                    
                    const top = (startHour - 8) * 64;
                    const height = (endHour - startHour) * 64;
                    
                    const isMine = booking.userId === user?.id;
                    const bgClass = isMine ? 'bg-primary-container border-primary text-on-primary-container' : 'bg-secondary-container border-secondary text-on-secondary-container';

                    return (
                      <div 
                        key={booking.id}
                        className="absolute w-[14.28%] p-1 cursor-pointer z-10"
                        style={{ top: `${top}px`, left: `${left}%`, height: `${height}px` }}
                        onClick={() => {
                          if (isMine) {
                            openBookingModal(booking.assetId, booking);
                          }
                        }}
                      >
                        <div className={`w-full h-full border-l-4 rounded p-2 overflow-hidden shadow-sm hover:brightness-110 transition-all ${bgClass}`}>
                          <p className="text-[11px] leading-tight font-bold">{booking.asset?.name || 'Asset'}</p>
                          <p className="text-[10px] opacity-80 mt-0.5 truncate">{booking.notes || 'Booked'}</p>
                        </div>
                      </div>
                    );
                  })}
                  
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
              {myBookings.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant text-sm">
                    No bookings found. 
                  </td>
                </tr>
              ) : (
                myBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-primary">{booking.asset?.name || 'Unknown Asset'}</td>
                    <td className="px-6 py-4 text-sm">{new Date(booking.startTime).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                      {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant italic">{booking.notes || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight ${
                        booking.status === 'upcoming' || booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'upcoming' && (
                        <>
                          <button onClick={() => openBookingModal(booking.assetId, booking)} className="p-1 hover:text-primary transition-colors"><Edit2 className="w-4 h-4 inline" /></button>
                          <button onClick={() => setDeleteId(booking.id)} className="p-1 hover:text-error transition-colors ml-2"><Trash2 className="w-4 h-4 inline" /></button>
                        </>
                      )}
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
          <div className="relative bg-surface border border-outline-variant w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary">{editingId ? 'Reschedule Booking' : 'Schedule Booking'}</h3>
              <button 
                className="text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">Resource Name</label>
                <div className="relative">
                  <select 
                    required
                    disabled={!!editingId} // Cannot change asset while rescheduling
                    className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm appearance-none"
                    value={formData.assetId}
                    onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                  >
                    {bookableAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">Start DateTime</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">End DateTime</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">Notes / Purpose</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm resize-none" 
                  placeholder="Reason for booking..." 
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-secondary-container/20 rounded-lg border border-secondary-container">
                <span className="text-secondary w-5 h-5">ℹ️</span>
                <p className="text-xs text-on-secondary-container">Overlapping bookings are automatically rejected. Please ensure the resource is available.</p>
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
                  {editingId ? 'Save Changes' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
          <div className="relative bg-surface w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-primary mb-2">Cancel Booking</h3>
            <p className="text-sm text-on-surface-variant mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleCancel(deleteId)} 
                className="px-4 py-2 bg-error text-on-error rounded-lg text-sm font-medium hover:brightness-110 transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
