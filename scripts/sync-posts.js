import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../posts');
const OUTPUT_FILE = path.join(__dirname, '../src/data/blogPosts.ts');

const syncPosts = () => {
    console.log('Syncing blog posts...');
    try {
        if (!fs.existsSync(POSTS_DIR)) {
            console.error(`Posts directory not found: ${POSTS_DIR}`);
            return;
        }

        const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
        const posts = files.map(file => {
            const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
            const { data, content: body } = matter(content);
            return {
                id: data.id,
                title: data.title,
                date: data.date,
                content: body.trim()
            };
        });

        // Sort by ID descending (newest first)
        posts.sort((a, b) => b.id - a.id);

        // Filter out posts without IDs to be safe
        const validPosts = posts.filter(p => p.id !== undefined);

        const fileContent = `export const posts = ${JSON.stringify(validPosts, null, 2)};`;

        fs.writeFileSync(OUTPUT_FILE, fileContent);
        console.log(`Successfully synced ${validPosts.length} posts to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error syncing posts:', error);
    }
};

if (process.argv.includes('--watch')) {
    console.log('Watching for changes in posts/ ...');
    syncPosts(); // Initial sync
    chokidar.watch(POSTS_DIR, { ignoreInitial: true }).on('all', (event, path) => {
        console.log(`[${event}] ${path}`);
        syncPosts();
    });
} else {
    syncPosts();
}
