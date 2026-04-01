import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
}

export const compressImage = async (file: File, options?: CompressionOptions): Promise<File> => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const defaultOptions = {
        maxSizeMB: 0.8, // Max 0.8MB (reduced from 1MB)
        maxWidthOrHeight: 1200, // Max 1200px width or height (sufficient for most screens)
        useWebWorker: true,
        initialQuality: 0.75, // Quality set to 0.75 for better compression
        fileType: 'image/webp', // Force conversion to WebP
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const compressedFile = await imageCompression(file, finalOptions);
        console.log(`Image compressed: ${file.size / 1024 / 1024} MB -> ${compressedFile.size / 1024 / 1024} MB`);
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        // Return original file if compression fails
        return file;
    }
};
