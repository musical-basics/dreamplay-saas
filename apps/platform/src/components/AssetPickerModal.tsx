"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Upload, Check, Loader2 } from "lucide-react";
import { getAssets, createAsset } from "../app/actions/assets";

interface Asset {
    id: string;
    name: string;
    url: string;
    mimeType?: string | null;
    size?: number | null;
    createdAt: Date;
}

interface AssetPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

// Simple function to upload to a public image host (using imgbb as fallback)
// In production, you should use your own storage (Supabase, S3, Cloudinary, etc.)
async function uploadToStorage(file: File): Promise<string> {
    // For now, we'll use a simple approach: convert to base64 data URL
    // In production, replace this with real storage like Supabase Storage
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Check if result is a reasonable size (less than 5MB for data URLs)
            const result = reader.result as string;
            if (result.length > 5 * 1024 * 1024) {
                reject(new Error("File too large. Please use a smaller image."));
                return;
            }
            resolve(result);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

export function AssetPickerModal({ isOpen, onClose, onSelect }: AssetPickerModalProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAssetUrl, setSelectedAssetUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Load assets on mount
    useEffect(() => {
        if (isOpen) {
            loadAssets();
        }
    }, [isOpen]);

    const loadAssets = async () => {
        setIsLoading(true);
        try {
            const data = await getAssets();
            setAssets(data as Asset[]);
        } catch (error) {
            console.error("Failed to load assets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) {
                    alert("Only image files are supported");
                    continue;
                }

                // Upload to storage
                const url = await uploadToStorage(file);

                // Create asset record
                await createAsset({
                    name: `${Date.now()}-${file.name}`,
                    url,
                    mimeType: file.type,
                    size: file.size,
                });
            }
            // Reload assets
            await loadAssets();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed: " + (error as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleUpload(e.dataTransfer.files);
    }, []);

    const handleSelectAsset = () => {
        if (selectedAssetUrl) {
            onSelect(selectedAssetUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-lg bg-slate-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">Select Image Asset</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto p-6">
                    {/* Upload Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${isDragging
                                ? "border-amber-500 bg-amber-500/10"
                                : "border-slate-600 hover:border-slate-500"
                            }`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mb-2 h-8 w-8 animate-spin text-slate-400" />
                                <p className="text-sm text-slate-400">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="mb-2 h-8 w-8 text-slate-400" />
                                <p className="text-sm text-slate-400">
                                    Drag & drop or{" "}
                                    <label className="cursor-pointer text-amber-500 hover:text-amber-400">
                                        click to upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => handleUpload(e.target.files)}
                                        />
                                    </label>
                                </p>
                            </>
                        )}
                    </div>

                    {/* Asset Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : assets.length === 0 ? (
                        <p className="py-12 text-center text-sm text-slate-500">
                            No assets uploaded yet. Drop an image above to get started.
                        </p>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {assets.map((asset) => (
                                <button
                                    key={asset.id}
                                    onClick={() => setSelectedAssetUrl(asset.url)}
                                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedAssetUrl === asset.url
                                            ? "border-amber-500 ring-2 ring-amber-500/50"
                                            : "border-transparent hover:border-slate-500"
                                        }`}
                                >
                                    <img
                                        src={asset.url}
                                        alt={asset.name}
                                        className="h-full w-full object-cover"
                                    />
                                    {selectedAssetUrl === asset.url && (
                                        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
                                            <Check className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <p className="truncate text-xs text-white/80">
                                            {asset.name}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-700 px-6 py-4">
                    <p className="text-sm text-slate-500">
                        Showing {assets.length} assets
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-md px-4 py-2 text-sm text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSelectAsset}
                            disabled={!selectedAssetUrl}
                            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Select Asset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
