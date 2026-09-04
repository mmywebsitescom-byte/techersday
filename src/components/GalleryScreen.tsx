import React, { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Plus,
  X,
  Calendar,
  Tag,
  Heart,
  Share2,
  ZoomIn,
  Home,
  Building2,
  Download,
  CheckCircle,
  Check,
  Eye,
  ChevronLeft,
  ChevronRight,
  Archive,
  Layers,
  CheckSquare,
  Square,
  Loader2,
  FileArchive,
} from 'lucide-react';
import { GalleryCategory, GalleryItem } from '../types';
import { Footer } from './Footer';
import {
  downloadImageFile,
  downloadMultipleImagesAsZip,
  downloadMultipleImagesSequentially,
  DownloadProgress,
} from '../utils/downloadUtils';

interface GalleryScreenProps {
  galleryItems: GalleryItem[];
  onAddMemory?: (memory: Omit<GalleryItem, 'id'>) => void;
  onNavigate?: (screen: 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin') => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  galleryItems,
  onAddMemory,
  onNavigate,
}) => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('All');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  // Download Progress State
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // New Memory Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Events' | 'Classroom' | 'Faculty' | 'Celebrations'>('Classroom');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const categories: GalleryCategory[] = ['All', 'Events', 'Classroom', 'Faculty', 'Celebrations'];

  const presetMemoryPhotos = [
    { label: 'Annual Teachers Gala', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', cat: 'Celebrations' as const },
    { label: 'Faculty Council', url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80', cat: 'Faculty' as const },
    { label: 'Auditorium Keynote', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80', cat: 'Events' as const },
    { label: 'Physics Lab Session', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', cat: 'Classroom' as const },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  const currentLightboxPhoto = selectedPhotoIndex !== null && filteredItems[selectedPhotoIndex]
    ? filteredItems[selectedPhotoIndex]
    : null;

  // Toggle single item selection
  const togglePhotoSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all in current filter
  const handleSelectAll = () => {
    const allFilteredIds = filteredItems.map((item) => item.id);
    setSelectedPhotoIds(new Set(allFilteredIds));
    setIsSelectionMode(true);
    showToast(`Selected all ${allFilteredIds.length} photos in view`);
  };

  // Deselect all
  const handleClearSelection = () => {
    setSelectedPhotoIds(new Set());
    setIsSelectionMode(false);
  };

  // Single Photo Download
  const handleDownloadSingle = async (photoUrl: string, photoTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast(`Downloading "${photoTitle}"...`);
    const success = await downloadImageFile(photoUrl, `${photoTitle}.jpg`);
    if (success) {
      showToast(`Downloaded "${photoTitle}" successfully!`);
    }
  };

  // Batch ZIP Download for Selected Photos
  const handleDownloadSelectedZip = async () => {
    const itemsToDownload = galleryItems.filter((item) => selectedPhotoIds.has(item.id));
    if (itemsToDownload.length === 0) {
      showToast('Please select at least one photo to download');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress({
      current: 0,
      total: itemsToDownload.length,
      percent: 5,
      statusText: `Preparing ${itemsToDownload.length} photos for ZIP download...`,
    });

    const photosList = itemsToDownload.map((item) => ({
      url: item.imageUrl,
      title: item.title,
    }));

    const result = await downloadMultipleImagesAsZip(
      photosList,
      `teachers_day_memories_${new Date().toISOString().slice(0, 10)}.zip`,
      (progress) => {
        setDownloadProgress(progress);
      }
    );

    setIsDownloading(false);
    if (result.success) {
      showToast(`Downloaded ${result.downloadedCount} photos as ZIP archive!`);
      setTimeout(() => setDownloadProgress(null), 1800);
    } else {
      // Fallback if ZIP creation was blocked
      showToast('Fallback: downloading photos individually...');
      await downloadMultipleImagesSequentially(photosList, (progress) => {
        setDownloadProgress(progress);
      });
      setTimeout(() => setDownloadProgress(null), 1800);
    }
  };

  // Download All Photos in Gallery as ZIP
  const handleDownloadAllZip = async () => {
    const itemsToDownload = filteredItems.length > 0 ? filteredItems : galleryItems;
    if (itemsToDownload.length === 0) {
      showToast('No photos available to download');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress({
      current: 0,
      total: itemsToDownload.length,
      percent: 5,
      statusText: `Preparing all ${itemsToDownload.length} photos...`,
    });

    const photosList = itemsToDownload.map((item) => ({
      url: item.imageUrl,
      title: item.title,
    }));

    const result = await downloadMultipleImagesAsZip(
      photosList,
      `all_teachers_day_gallery_${new Date().toISOString().slice(0, 10)}.zip`,
      (progress) => {
        setDownloadProgress(progress);
      }
    );

    setIsDownloading(false);
    if (result.success) {
      showToast(`Downloaded all ${result.downloadedCount} photos as ZIP archive!`);
      setTimeout(() => setDownloadProgress(null), 2000);
    } else {
      showToast('Failed to package photos. Trying individual downloads...');
      await downloadMultipleImagesSequentially(photosList, (progress) => {
        setDownloadProgress(progress);
      });
      setTimeout(() => setDownloadProgress(null), 2000);
    }
  };

  // Lightbox Navigation
  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => {
      if (prev === null) return 0;
      return prev > 0 ? prev - 1 : filteredItems.length - 1;
    });
  }, [selectedPhotoIndex, filteredItems.length]);

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => {
      if (prev === null) return 0;
      return prev < filteredItems.length - 1 ? prev + 1 : 0;
    });
  }, [selectedPhotoIndex, filteredItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handlePrevPhoto, handleNextPhoto]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    if (onAddMemory) {
      onAddMemory({
        title,
        category,
        imageUrl,
        date: date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        description,
      });
      showToast(`Memory "${title}" published to celebration gallery!`);
    }

    setTitle('');
    setImageUrl('');
    setDescription('');
    setDate('');
    setIsPreviewActive(false);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbf9f8] text-[#1b1c1c]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#180331] text-[#ffe088] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-[#ffe088]/30">
          <CheckCircle size={18} />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Download Progress Modal Overlay */}
      {downloadProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-[#180331] text-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#ffe088]/40 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#fed65b]/20 text-[#ffe088]">
                {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <FileArchive size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-playfair text-lg font-bold text-[#ffe088] truncate">
                  Downloading Multiple Photos
                </h4>
                <p className="text-xs text-purple-200 truncate">
                  {downloadProgress.statusText}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-purple-200">
                <span>Progress ({downloadProgress.current}/{downloadProgress.total})</span>
                <span className="font-bold text-[#ffe088]">{downloadProgress.percent}%</span>
              </div>
              <div className="w-full bg-white/15 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#fed65b] to-[#ffe088] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${downloadProgress.percent}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-purple-300 italic text-center">
              Please wait while high-resolution photos are being packaged and downloaded.
            </p>
          </div>
        </div>
      )}

      <main className="pt-24 sm:pt-28 pb-28 px-5 md:px-8 max-w-[1240px] mx-auto w-full flex-grow">
        {/* Header Section */}
        <div className="text-center mb-8 max-w-2xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fed65b]/20 border border-[#180331]/15 text-[#180331] text-xs font-semibold uppercase tracking-wider mb-3">
            <ImageIcon size={13} />
            Celebration Photo Archive
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl text-[#180331] font-bold mb-3 tracking-tight uppercase">
            MEMORIES
          </h1>
          <p className="font-inter text-base sm:text-lg text-[#4a454e]">
            View, select, and download high-resolution photos honoring our teachers and memorable milestones.
          </p>
        </div>

        {/* Action Controls & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#ffffff] p-4 rounded-2xl border border-[#180331]/10 shadow-xs">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-inter text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#180331] text-[#ffffff] shadow-sm scale-105'
                      : 'bg-[#fed65b]/15 text-[#180331] border border-[#180331]/15 hover:bg-[#180331] hover:text-[#ffffff]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick Actions (Select Mode, Download All, Add Memory) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                if (isSelectionMode && selectedPhotoIds.size > 0) {
                  handleClearSelection();
                } else {
                  setIsSelectionMode(!isSelectionMode);
                }
              }}
              className={`px-4 py-2 rounded-xl font-inter text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isSelectionMode
                  ? 'bg-[#180331] text-[#ffe088] shadow-md border border-[#ffe088]/40'
                  : 'bg-[#fbf9f8] hover:bg-[#efeded] text-[#180331] border border-[#ccc4cf]'
              }`}
            >
              <CheckSquare size={15} />
              {isSelectionMode ? `Selection Mode (${selectedPhotoIds.size})` : 'Select Multiple'}
            </button>

            <button
              onClick={handleDownloadAllZip}
              className="px-4 py-2 rounded-xl bg-[#fed65b] hover:bg-[#ffe088] text-[#180331] font-inter text-xs font-bold flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
              title="Download all photos in this view as a ZIP archive"
            >
              <Archive size={15} />
              Download All ({filteredItems.length})
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 rounded-xl font-inter text-xs font-semibold text-[#735c00] bg-[#fed65b]/15 border border-[#735c00]/30 hover:bg-[#fed65b]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={15} />
              Add Photo
            </button>
          </div>
        </div>

        {/* Selection Toolbar (Shown when selection mode is active or items are selected) */}
        {isSelectionMode && (
          <div className="mb-6 p-4 rounded-2xl bg-[#180331] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#ffe088]/30 animate-fade-in-up">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="p-2 rounded-xl bg-[#fed65b] text-[#180331] font-bold text-xs flex items-center gap-1.5">
                <Check size={14} />
                {selectedPhotoIds.size} Selected
              </span>
              <p className="text-xs text-purple-200">
                Click photo checkmarks to select/deselect items for batch download.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-[#ffe088] transition-colors cursor-pointer"
              >
                Select All ({filteredItems.length})
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={selectedPhotoIds.size === 0 || isDownloading}
                onClick={handleDownloadSelectedZip}
                className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  selectedPhotoIds.size > 0
                    ? 'bg-[#fed65b] text-[#180331] hover:bg-[#ffe088] shadow-lg hover:scale-102'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                }`}
              >
                <Download size={15} />
                Download Selected ({selectedPhotoIds.size}) as ZIP
              </button>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredItems.map((item, index) => {
            const isSelected = selectedPhotoIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSelectionMode) {
                    togglePhotoSelection(item.id);
                  } else {
                    setSelectedPhotoIndex(index);
                  }
                }}
                className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-[#ffffff] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  isSelected
                    ? 'ring-4 ring-[#fed65b] ring-offset-2 border-transparent shadow-lg'
                    : 'border border-[#180331]/10'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#efeded] relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isSelected ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Multi-Select Checkbox Badge on Top-Left */}
                  <button
                    type="button"
                    onClick={(e) => togglePhotoSelection(item.id, e)}
                    className={`absolute top-3 left-3 z-30 p-1.5 rounded-xl transition-all shadow-md cursor-pointer ${
                      isSelected
                        ? 'bg-[#fed65b] text-[#180331] scale-110'
                        : isSelectionMode
                        ? 'bg-black/60 text-white hover:bg-black/80'
                        : 'bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-black/80'
                    }`}
                    title={isSelected ? 'Deselect photo' : 'Select photo'}
                  >
                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>

                  {/* Direct Single Download Button on Top-Right */}
                  <button
                    type="button"
                    onClick={(e) => handleDownloadSingle(item.imageUrl, item.title, e)}
                    className="absolute top-3 right-3 bg-[#ffffff]/90 hover:bg-[#ffffff] text-[#180331] p-2 rounded-xl shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer z-30"
                    title="Download this photo"
                  >
                    <Download size={16} />
                  </button>
                </div>

                {/* Info Overlay / Footer Card Details */}
                <div className="p-4 bg-white border-t border-[#efeded] flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-inter uppercase tracking-wider text-[#735c00] font-bold bg-[#fed65b]/20 px-2.5 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#7b757f] flex items-center gap-1 font-medium">
                      <Calendar size={12} />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-[#180331] font-inter text-sm font-semibold line-clamp-1 group-hover:text-[#520085] transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#f4f2f0] text-xs">
                    <span className="text-[#7b757f] flex items-center gap-1 group-hover:text-[#180331]">
                      <ZoomIn size={13} />
                      View Large
                    </span>
                    <span className="text-[#735c00] font-semibold flex items-center gap-1">
                      <Download size={13} />
                      Save
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-[#ffffff] rounded-2xl border border-[#ccc4cf]/30 my-8">
            <ImageIcon className="w-12 h-12 mx-auto text-[#7b757f] mb-3" />
            <p className="font-playfair text-xl text-[#180331] font-semibold">No memories in this category yet</p>
            <p className="text-xs text-[#4a454e] mt-1">Be the first to share an honorary photo or tribute.</p>
          </div>
        )}
      </main>

      {/* Enhanced Multi-Photo Lightbox Modal with Carousel Strip */}
      {currentLightboxPhoto && selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fade-in-up">
          {/* Close Lightbox */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer border border-white/20"
            title="Close viewer (Esc)"
          >
            <X size={22} />
          </button>

          {/* Left Arrow Navigation */}
          {filteredItems.length > 1 && (
            <button
              onClick={handlePrevPhoto}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 bg-black/70 hover:bg-black text-white p-3 rounded-full transition-all hover:scale-110 cursor-pointer border border-white/20"
              title="Previous photo (Left Arrow)"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow Navigation */}
          {filteredItems.length > 1 && (
            <button
              onClick={handleNextPhoto}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 bg-black/70 hover:bg-black text-white p-3 rounded-full transition-all hover:scale-110 cursor-pointer border border-white/20"
              title="Next photo (Right Arrow)"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="bg-[#ffffff] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl relative border border-[#180331]/30 flex flex-col">
            {/* Main Lightbox Image */}
            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[55vh] overflow-hidden">
              <img
                src={currentLightboxPhoto.imageUrl}
                alt={currentLightboxPhoto.title}
                className="max-h-[55vh] w-auto max-w-full object-contain select-none"
              />

              {/* Photo Index Counter Badge */}
              <span className="absolute top-4 left-4 bg-black/70 text-[#ffe088] px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs border border-white/20">
                Photo {selectedPhotoIndex + 1} of {filteredItems.length}
              </span>
            </div>

            {/* Thumbnail Filmstrip for Rapid Multi-Photo Browsing */}
            {filteredItems.length > 1 && (
              <div className="bg-[#180331] px-4 py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-thin">
                {filteredItems.map((item, idx) => {
                  const isCurrent = idx === selectedPhotoIndex;
                  const isSelectedInBatch = selectedPhotoIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative flex-shrink-0 w-14 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#fed65b] scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      {isSelectedInBatch && (
                        <div className="absolute top-0.5 right-0.5 bg-[#fed65b] text-[#180331] rounded-full p-0.5">
                          <Check size={8} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Lightbox Details & Action Buttons */}
            <div className="p-5 md:p-6 bg-[#ffffff] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="bg-[#fed65b]/20 text-[#180331] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {currentLightboxPhoto.category}
                  </span>
                  <span className="text-xs text-[#7b757f] flex items-center gap-1 font-medium">
                    <Calendar size={14} />
                    {currentLightboxPhoto.date}
                  </span>
                </div>

                {/* Toggle Select Checkbox inside Lightbox */}
                <button
                  type="button"
                  onClick={() => togglePhotoSelection(currentLightboxPhoto.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedPhotoIds.has(currentLightboxPhoto.id)
                      ? 'bg-[#fed65b] text-[#180331]'
                      : 'bg-[#efeded] text-[#4a454e] hover:bg-[#dedede]'
                  }`}
                >
                  {selectedPhotoIds.has(currentLightboxPhoto.id) ? (
                    <>
                      <CheckSquare size={15} /> Selected for Batch Download
                    </>
                  ) : (
                    <>
                      <Square size={15} /> Select for Batch Download
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-playfair text-xl md:text-2xl font-bold text-[#180331] mb-1.5">
                {currentLightboxPhoto.title}
              </h3>

              {currentLightboxPhoto.description && (
                <p className="text-[#4a454e] text-xs md:text-sm leading-relaxed mb-4">
                  {currentLightboxPhoto.description}
                </p>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#efeded] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs italic text-[#7b757f]">
                  Excellence Institute Memorial Archive • Teachers' Day Celebration
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Download this photo */}
                  <button
                    onClick={() => handleDownloadSingle(currentLightboxPhoto.imageUrl, currentLightboxPhoto.title)}
                    className="btn-primary flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    Download Photo
                  </button>

                  {/* If multiple selected, allow downloading batch directly from lightbox */}
                  {selectedPhotoIds.size > 0 && (
                    <button
                      onClick={handleDownloadSelectedZip}
                      className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#180331] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-[#ffe088] transition-colors cursor-pointer"
                    >
                      <Archive size={15} />
                      Download {selectedPhotoIds.size} Selected (ZIP)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#ccc4cf]/40 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-[#7b757f] hover:text-[#180331] p-1.5 rounded-full hover:bg-[#efeded] cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="font-playfair text-2xl font-bold text-[#180331] mb-1">
              Share a Celebration Memory
            </h3>
            <p className="text-xs text-[#4a454e] mb-5">
              Contribute a memorable moment, classroom achievement, or faculty tribute.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Photo Preview Box */}
              {imageUrl && (
                <div className="rounded-xl border border-[#ccc4cf]/60 overflow-hidden bg-[#efeded] relative h-40">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="absolute bottom-2 left-2 bg-[#180331]/80 text-[#ffffff] px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-2xs">
                    Live Photo Preview
                  </span>
                </div>
              )}

              {/* Photo URL with Preview Button */}
              <div>
                <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                  Photo URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs focus:border-[#180331] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPreviewActive(true)}
                    className="px-4 py-2.5 bg-[#efeded] hover:bg-[#dedede] text-[#180331] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>

                {/* Preset Options */}
                <div className="mt-2">
                  <span className="text-[10px] text-[#7b757f] block mb-1 font-medium">Or pick a sample photo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetMemoryPhotos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(p.url);
                          setCategory(p.cat);
                          if (!title) setTitle(p.label);
                        }}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          imageUrl === p.url
                            ? 'bg-[#180331] text-[#ffffff] border-[#180331]'
                            : 'bg-[#fbf9f8] text-[#4a454e] border-[#ccc4cf] hover:bg-[#efeded]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Memory Title */}
              <div>
                <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair Mentorship 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none cursor-pointer"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Events">Events</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Celebrations">Celebrations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Date / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. September 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a brief reflection or celebration note..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-xs focus:border-[#180331] outline-none resize-none"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#efeded]">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#ccc4cf] text-xs font-semibold uppercase tracking-wider text-[#4a454e] hover:bg-[#efeded] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Post Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
