'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Download, Plus, Trash2, Move, Maximize, Save, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import cardSpaces from '@/lib/card-spaces.json';

interface Region {
  id: string;
  purpose: string;
  type: 'rect' | 'group';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  anchor_points: number[][];
  fill_suggestion: string;
  dataField?: string;
  zIndex?: number;
}

const CARD_TEMPLATE = cardSpaces.cardTemplate;
const LAYOUT = cardSpaces.layout;

export function CardTemplateEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [regions, setRegions] = useState<Region[]>(cardSpaces.regions as Region[]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    regionId: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ isDragging: false, regionId: null, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const [resizeState, setResizeState] = useState<{
    isResizing: boolean;
    regionId: string | null;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
  }>({ isResizing: false, regionId: null, startX: 0, startY: 0, initialWidth: 0, initialHeight: 0, initialX: 0, initialY: 0 });
  const [scale, setScale] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState('/icons/cards/golden.png');

  // Calculate scale factor
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth / LAYOUT.dimensions.width;
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, regionId: string, action: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    
    const region = regions.find(r => r.id === regionId);
    if (!region) return;

    if (action === 'move') {
      setDragState({
        isDragging: true,
        regionId,
        startX: e.clientX,
        startY: e.clientY,
        initialX: region.bounds.x,
        initialY: region.bounds.y,
      });
      setSelectedRegion(regionId);
    } else {
      setResizeState({
        isResizing: true,
        regionId,
        startX: e.clientX,
        startY: e.clientY,
        initialWidth: region.bounds.width,
        initialHeight: region.bounds.height,
        initialX: region.bounds.x,
        initialY: region.bounds.y,
      });
      setSelectedRegion(regionId);
    }
  }, [regions]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Handle dragging
    if (dragState.isDragging && dragState.regionId) {
      const deltaX = (e.clientX - dragState.startX) / scale;
      const deltaY = (e.clientY - dragState.startY) / scale;
      
      setRegions(prev => prev.map(r => {
        if (r.id === dragState.regionId) {
          return {
            ...r,
            bounds: {
              ...r.bounds,
              x: Math.max(0, Math.min(LAYOUT.dimensions.width - r.bounds.width, dragState.initialX + deltaX)),
              y: Math.max(0, Math.min(LAYOUT.dimensions.height - r.bounds.height, dragState.initialY + deltaY)),
            },
          };
        }
        return r;
      }));
    }

    // Handle resizing
    if (resizeState.isResizing && resizeState.regionId) {
      const deltaX = (e.clientX - resizeState.startX) / scale;
      const deltaY = (e.clientY - resizeState.startY) / scale;
      
      setRegions(prev => prev.map(r => {
        if (r.id === resizeState.regionId) {
          const newWidth = Math.max(20, resizeState.initialWidth + deltaX);
          const newHeight = Math.max(20, resizeState.initialHeight + deltaY);
          return {
            ...r,
            bounds: {
              ...r.bounds,
              width: Math.min(LAYOUT.dimensions.width - r.bounds.x, newWidth),
              height: Math.min(LAYOUT.dimensions.height - r.bounds.y, newHeight),
            },
          };
        }
        return r;
      }));
    }
  }, [dragState, resizeState, scale]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, regionId: null, startX: 0, startY: 0, initialX: 0, initialY: 0 });
    setResizeState({ isResizing: false, regionId: null, startX: 0, startY: 0, initialWidth: 0, initialHeight: 0, initialX: 0, initialY: 0 });
  }, []);

  useEffect(() => {
    if (dragState.isDragging || resizeState.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, resizeState.isResizing, handleMouseMove, handleMouseUp]);

  const addRegion = () => {
    const newRegion: Region = {
      id: `region-${Date.now()}`,
      purpose: 'New Region',
      type: 'rect',
      bounds: { x: 50, y: 50, width: 100, height: 100 },
      anchor_points: [],
      fill_suggestion: 'text',
      zIndex: 20,
    };
    setRegions([...regions, newRegion]);
    setSelectedRegion(newRegion.id);
  };

  const deleteRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
    if (selectedRegion === id) setSelectedRegion(null);
  };

  const updateRegion = (id: string, updates: Partial<Region>) => {
    setRegions(regions.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const exportJSON = () => {
    const exportData = {
      layout: LAYOUT,
      cardTemplate: CARD_TEMPLATE,
      cardTypeConfig: cardSpaces.cardTypeConfig,
      regions: regions.map(r => ({
        ...r,
        bounds: {
          x: Math.round(r.bounds.x),
          y: Math.round(r.bounds.y),
          width: Math.round(r.bounds.width),
          height: Math.round(r.bounds.height),
        },
      })),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'card-spaces.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedRegionData = regions.find(r => r.id === selectedRegion);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Editor Canvas */}
      <div className="flex-1">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Card Template Editor</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setBackgroundImage('/icons/cards/bronze_base.png')}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Bronze
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBackgroundImage('/icons/cards/silver.png')}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Silver
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBackgroundImage('/icons/cards/golden.png')}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Gold
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBackgroundImage('/icons/cards/if.png')}>
                <ImageIcon className="w-4 h-4 mr-2" />
                IF
              </Button>
            </div>
          </div>
          
          <div 
            ref={containerRef}
            className="relative mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            style={{
              width: '100%',
              maxWidth: `${LAYOUT.dimensions.width}px`,
              aspectRatio: `${LAYOUT.dimensions.width} / ${LAYOUT.dimensions.height}`,
            }}
            onClick={() => setSelectedRegion(null)}
          >
            {/* Card Background */}
            <Image
              src={backgroundImage}
              alt="Card template"
              fill
              className="object-cover"
              priority
            />
            
            {/* Regions Overlay */}
            {regions.filter(region => region.bounds && region.bounds.x !== null && region.bounds.y !== null).map((region) => (
              <div
                key={region.id}
                className={cn(
                  'absolute border-2 cursor-move transition-all',
                  selectedRegion === region.id 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-red-400 bg-red-400/10 hover:bg-red-400/20'
                )}
                style={{
                  left: `${region.bounds.x * scale}px`,
                  top: `${region.bounds.y * scale}px`,
                  width: `${region.bounds.width * scale}px`,
                  height: `${region.bounds.height * scale}px`,
                  zIndex: region.zIndex || 10,
                }}
                onMouseDown={(e) => handleMouseDown(e, region.id, 'move')}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegion(region.id);
                }}
              >
                {/* Region Label */}
                <div className="absolute -top-6 left-0 text-xs font-bold text-red-600 bg-white/90 px-1 rounded whitespace-nowrap">
                  {region.id}
                </div>
                
                {/* Resize Handle */}
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600"
                  onMouseDown={(e) => handleMouseDown(e, region.id, 'resize')}
                />
                
                {/* Region Info */}
                <div className="absolute inset-0 flex items-center justify-center text-xs text-red-600 font-mono opacity-50 pointer-events-none">
                  {Math.round(region.bounds.width)}×{Math.round(region.bounds.height)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Original: {LAYOUT.dimensions.width}×{LAYOUT.dimensions.height}px | Scale: {(scale * 100).toFixed(1)}%
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addRegion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Region
              </Button>
              <Button onClick={exportJSON}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Properties Panel */}
      <div className="w-full lg:w-80">
        <Card className="p-4">
          <h3 className="font-bold mb-4">Region Properties</h3>
          
          {selectedRegionData ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <Input
                  value={selectedRegionData.id}
                  onChange={(e) => updateRegion(selectedRegionData.id, { id: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Purpose</Label>
                <Input
                  value={selectedRegionData.purpose}
                  onChange={(e) => updateRegion(selectedRegionData.id, { purpose: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>X</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedRegionData.bounds.x)}
                    onChange={(e) => updateRegion(selectedRegionData.id, {
                      bounds: { ...selectedRegionData.bounds, x: Number(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Y</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedRegionData.bounds.y)}
                    onChange={(e) => updateRegion(selectedRegionData.id, {
                      bounds: { ...selectedRegionData.bounds, y: Number(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Width</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedRegionData.bounds.width)}
                    onChange={(e) => updateRegion(selectedRegionData.id, {
                      bounds: { ...selectedRegionData.bounds, width: Number(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedRegionData.bounds.height)}
                    onChange={(e) => updateRegion(selectedRegionData.id, {
                      bounds: { ...selectedRegionData.bounds, height: Number(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Data Field</Label>
                <Input
                  value={selectedRegionData.dataField || ''}
                  onChange={(e) => updateRegion(selectedRegionData.id, { dataField: e.target.value })}
                  placeholder="e.g., user.image"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Fill Suggestion</Label>
                <Input
                  value={selectedRegionData.fill_suggestion}
                  onChange={(e) => updateRegion(selectedRegionData.id, { fill_suggestion: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Z-Index</Label>
                <Input
                  type="number"
                  value={selectedRegionData.zIndex || 10}
                  onChange={(e) => updateRegion(selectedRegionData.id, { zIndex: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => deleteRegion(selectedRegionData.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Region
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Move className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a region to edit properties</p>
              <p className="text-sm mt-2">• Drag to move</p>
              <p className="text-sm">• Drag resize handle to resize</p>
            </div>
          )}
        </Card>
        
        <Card className="p-4 mt-4">
          <h3 className="font-bold mb-2">Instructions</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Click and drag regions to move them</li>
            <li>• Drag the blue handle to resize</li>
            <li>• Click a region to select and edit properties</li>
            <li>• Export JSON to save your changes</li>
            <li>• Switch card backgrounds to test different styles</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}