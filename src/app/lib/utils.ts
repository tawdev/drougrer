/**
 * Utility functions for the blog system.
 */

/**
 * Calculates the estimated reading time for a block of text or HTML.
 * Average reading speed is 200 words per minute.
 * 
 * @param content The HTML or text content of the article.
 * @returns The estimated reading time in minutes (minimum 1).
 */
export function calculateReadTime(content: string | null | undefined): number {
    if (!content) return 1;

    // 1. Strip HTML tags from the content
    const plainText = content.replace(/<[^>]*>/g, ' ');

    // 2. Count words by splitting by whitespace
    const words = plainText.trim().split(/\s+/).length;

    // 3. Calculate minutes (average 200 words per minute)
    // We use Math.ceil to round up to the nearest minute.
    const minutes = Math.ceil(words / 200);

    // Return the result, ensuring at least 1 minute.
    return Math.max(1, minutes);
}

/**
 * Returns a fully qualified URL for images, supporting relative paths from the backend.
 * 
 * @param url The image URL.
 * @returns The fully qualified absolute URL.
 */
export function getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}
