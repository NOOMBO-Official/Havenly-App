import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSettings } from '../contexts/SettingsContext';
import { useLongPress } from '../hooks/useLongPress';

import QuickActions from "./QuickActions";
import SmartHomeWidget from "./SmartHomeWidget";
import WeatherWidget from "./WeatherWidget";
import MediaWidget from "./MediaWidget";
import IntegrationsWidget from "./IntegrationsWidget";
import CalendarWidget from "./CalendarWidget";
import NotionWidget from "./NotionWidget";
import GoogleCalendarWidget from "./GoogleCalendarWidget";
import ClockWidget from "./ClockWidget";
import ThreeDWidget from "./ThreeDWidget";
import AiGeneratedWidget from "./AiGeneratedWidget";
import { X, Plus } from 'lucide-react';

const WIDGET_COMPONENTS: Record<string, React.FC<any>> = {
  quickActions: QuickActions,
  smartHome: SmartHomeWidget,
  weather: WeatherWidget,
  media: MediaWidget,
  integrations: IntegrationsWidget,
  calendar: CalendarWidget,
  notion: NotionWidget,
  googleCalendar: GoogleCalendarWidget,
  clock: ClockWidget,
  threed: ThreeDWidget,
};

interface SortableWidgetProps {
  id: string;
  isEditMode: boolean;
  onRemove: (id: string) => void;
}

function SortableWidget({ id, isEditMode, onRemove }: SortableWidgetProps) {
  const { settings } = useSettings();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const Component = WIDGET_COMPONENTS[id];
  const aiWidget = settings.aiWidgets?.find(w => w.id === id);

  if (!Component && !aiWidget) return null;

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      {isEditMode && (
        <div 
          className="absolute -top-3 -right-3 z-20 p-1.5 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-600 shadow-lg"
          onClick={() => onRemove(id)}
        >
          <X className="w-4 h-4" />
        </div>
      )}
      <div {...(isEditMode ? { ...attributes, ...(listeners || {}) } : {})} className={`h-full transition-transform duration-500 hover:scale-[1.02] ${isEditMode ? "cursor-grab active:cursor-grabbing hover:scale-100" : ""}`}>
        <div className={`h-full ${isEditMode ? "pointer-events-none ring-2 ring-blue-500/50 rounded-[2.5rem]" : ""}`}>
          {Component ? <Component /> : aiWidget ? <AiGeneratedWidget {...aiWidget} /> : null}
        </div>
      </div>
    </div>
  );
}

export default function WidgetGrid() {
  const { settings, updateSettings } = useSettings();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const longPressProps = useLongPress(() => {
    if (!isEditMode) {
      setIsEditMode(true);
    }
  }, 5000); // 5 seconds

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = settings.layout.findIndex((l) => l.id === active.id);
      const newIndex = settings.layout.findIndex((l) => l.id === over.id);

      const newLayout = arrayMove(settings.layout, oldIndex, newIndex);
      
      // Update order
      const updatedLayout = newLayout.map((item: { id: string; column: number; order: number }, index: number) => ({
        ...item,
        order: index,
      }));

      updateSettings({ layout: updatedLayout });
    }
  };

  const handleRemoveWidget = (id: string) => {
    const newActiveWidgets = settings.activeWidgets.filter(w => w !== id);
    const newLayout = settings.layout.filter(l => l.id !== id);
    updateSettings({ activeWidgets: newActiveWidgets, layout: newLayout });
  };

  // Sort layout by order
  const sortedLayout = [...settings.layout].sort((a, b) => a.order - b.order);
  
  // Filter out widgets that are not active
  const activeLayout = sortedLayout.filter(l => settings.activeWidgets.includes(l.id));

  // Split into columns (for simplicity, we'll just alternate or use the column property if we want strict columns, 
  // but dnd-kit works best with a single list that wraps, or multiple lists.
  // Since the user wants to rearrange freely, let's use a CSS grid and a single SortableContext.
  
  return (
    <div className="relative" {...longPressProps}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-medium text-aura-text">Dashboard</h2>
        <button 
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isEditMode 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-aura-card border border-aura-border text-aura-text hover:bg-aura-card-hover'
          }`}
        >
          {isEditMode ? 'Done Editing' : 'Edit Layout'}
        </button>
      </div>

      {isEditMode && (
        <div className="sticky top-24 z-30 flex justify-between items-center bg-blue-500/20 border border-blue-500/50 backdrop-blur-md p-4 rounded-2xl mb-8">
          <span className="text-blue-400 font-medium">Edit Mode Active - Drag to reorder, click X to remove</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeLayout.map(l => l.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* We can map the layout into a CSS grid. Some widgets span 8 cols, some 4. */}
            {activeLayout.map((item) => {
              const isLarge = item.id === 'quickActions' || item.id === 'smartHome' || item.id === 'notion' || item.id === 'googleCalendar';
              return (
                <div key={item.id} className={isLarge ? 'lg:col-span-8' : 'lg:col-span-4'}>
                  <SortableWidget 
                    id={item.id} 
                    isEditMode={isEditMode} 
                    onRemove={handleRemoveWidget}
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-80 scale-105 shadow-2xl">
              {WIDGET_COMPONENTS[activeId] ? React.createElement(WIDGET_COMPONENTS[activeId]) : (
                settings.aiWidgets?.find(w => w.id === activeId) ? (
                  <AiGeneratedWidget {...settings.aiWidgets.find(w => w.id === activeId)!} />
                ) : null
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
