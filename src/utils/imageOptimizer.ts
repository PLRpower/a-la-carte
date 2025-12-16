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
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1920, // Max 1920px width or height
        useWebWorker: true,
        initialQuality: 0.8,
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
