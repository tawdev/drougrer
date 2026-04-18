const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'droguerie_db',
    });

    console.log('Connected to MySQL database!');

    try {
        const posts = [
            {
                title: '10 Essential DIY Home Improvement Tips for Spring',
                slug: '10-essential-diy-home-improvement-tips-for-spring',
                category: 'DIY Projects',
                content: `
                    <h2>Get Your Home Ready for the Season</h2>
                    <p>Spring is the perfect time to give your home a fresh start. Whether you're a seasoned DIYer or just starting out, these tips will help you tackle common household projects with ease.</p>
                    <h3>1. Inspect Your Windows and Doors</h3>
                    <p>Check for any gaps or cracks that might let in drafts. Applying fresh caulk can significantly improve your home's energy efficiency.</p>
                    <h3>2. Clean Your Gutters</h3>
                    <p>Winter debris can clog your gutters, leading to potential water damage. Make sure they're clear and flowing freely before the spring rains arrive.</p>
                    <h3>3. Update Your Lighting</h3>
                    <p>Swapping out old fixtures for modern, energy-efficient LED options can instantly brighten up any room.</p>
                    <p>Transform your living space with these simple yet effective tips from our experts. From painting techniques to quick fixes, we've got you covered for the new season.</p>
                `,
                excerpt: "Transform your living space with these simple yet effective tips from our experts. From painting techniques to quick fixes, we've got you covered for the new season.",
                imageUrl: 'https://images.unsplash.com/photo-1581578731522-9b7d72138072?auto=format&fit=crop&q=80&w=1200',
                status: 'Published'
            },
            {
                title: 'Natural Cleaning Hacks for Every Room',
                slug: 'natural-cleaning-hacks-for-every-room',
                category: 'Cleaning Tips',
                content: `
                    <h2>Clean Smarter, Not Harder</h2>
                    <p>You don't need harsh chemicals to keep your home sparkling clean. Many common household items like vinegar, baking soda, and lemons can be powerful cleaning agents.</p>
                    <h3>Kitchen Magic</h3>
                    <p>Use half a lemon and some salt to scrub your wooden cutting boards. It naturally disinfects and leaves a fresh scent.</p>
                    <h3>Sparkling Bathrooms</h3>
                    <p>A mixture of equal parts water and white vinegar is perfect for removing soap scum from glass shower doors.</p>
                    <p>Discover the power of vinegar, baking soda, and essential oils to make your home sparkle without the chemical load.</p>
                `,
                excerpt: "Discover the power of vinegar, baking soda, and essential oils to make your home sparkle without the chemical load.",
                imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
                status: 'Published'
            },
            {
                title: 'Gardening for Beginners: Start Your Oasis',
                slug: 'gardening-for-beginners-start-your-oasis',
                category: 'Gardening',
                content: `
                    <h2>Begin Your Green Journey</h2>
                    <p>Starting a garden might seem daunting, but with the right approach, anyone can develop a green thumb.</p>
                    <h3>Choose the Right Location</h3>
                    <p>Most plants need at least 6 hours of sunlight. Make sure your garden spot gets plenty of light.</p>
                    <h3>Prepare Your Soil</h3>
                    <p>Good soil is the foundation of a healthy garden. Consider adding compost to enrich your soil with nutrients.</p>
                    <p>Everything you need to know about soil, light, and watering to keep your first plants thriving all year long.</p>
                `,
                excerpt: "Everything you need to know about soil, light, and watering to keep your first plants thriving all year long.",
                imageUrl: 'https://images.unsplash.com/photo-1416870230247-414c8d3389a7?auto=format&fit=crop&q=80&w=800',
                status: 'Published'
            },
            {
                title: 'Organizing Your Workshop Like a Pro',
                slug: 'organizing-your-workshop-like-a-pro',
                category: 'DIY Projects',
                content: `
                    <h2>A Place for Everything</h2>
                    <p>A cluttered workshop isn't just frustrating; it can also be dangerous. Proper organization will make your projects more enjoyable and efficient.</p>
                    <h3>Use Pegboards</h3>
                    <p>Pegboards are a classic workshop staple for a reason. They keep your most-used tools within reach and off your workbench.</p>
                    <h3>Label Everything</h3>
                    <p>Transparent bins and clear labels will save you from digging through multiple containers to find one screw.</p>
                    <p>Tired of searching for that one wrench? Learn the art of pegboards and magnetic strips for tool mastery.</p>
                `,
                excerpt: "Tired of searching for that one wrench? Learn the art of pegboards and magnetic strips for tool mastery.",
                imageUrl: 'https://images.unsplash.com/photo-1504148455328-c9969787ede6?auto=format&fit=crop&q=80&w=800',
                status: 'Published'
            },
            {
                title: 'Eco-Friendly Pesticides That Work',
                slug: 'eco-friendly-pesticides-that-work',
                category: 'Eco-Friendly',
                content: `
                    <h2>Protect Your Plants Naturally</h2>
                    <p>Chemical pesticides can harm beneficial insects and the environment. Fortunately, there are many eco-friendly alternatives.</p>
                    <h3>Neem Oil</h3>
                    <p>Neem oil is an effective organic pesticide that targets many common garden pests while being safe for humans and pets.</p>
                    <h3>Companion Planting</h3>
                    <p>Certain plants naturally repel pests. For example, marigolds can help keep aphids away from your tomatoes.</p>
                    <p>Keep pests away without harming the environment. Safe, homemade alternatives for indoor and outdoor plants.</p>
                `,
                excerpt: "Keep pests away without harming the environment. Safe, homemade alternatives for indoor and outdoor plants.",
                imageUrl: 'https://images.unsplash.com/photo-1599309012354-94b2da8061eb?auto=format&fit=crop&q=80&w=800',
                status: 'Published'
            },
            {
                title: 'The Best Vacuums for Pet Owners in 2024',
                slug: 'the-best-vacuums-for-pet-owners-in-2024',
                category: 'Maintenance',
                content: `
                    <h2>Conquer Pet Hair</h2>
                    <p>If you have pets, you know that keeping your floors clear of fur is a constant battle. We've tested the top vacuums to find the ones that truly deliver.</p>
                    <p>From cordless sticks to robot vacs, see which models stand up to even the heaviest shedders.</p>
                `,
                excerpt: "From cordless sticks to robot vacs, see which models stand up to even the heaviest shedders.",
                imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400',
                status: 'Published'
            },
            {
                title: 'How to Choose the Right Paint Finish',
                slug: 'how-to-choose-the-right-paint-finish',
                category: 'DIY Projects',
                content: `
                    <h2>Matte, Satin, or Gloss?</h2>
                    <p>Choosing the right color is only half the battle. The finish you pick can dramatically change the look and durability of your walls.</p>
                `,
                excerpt: "Choosing the right color is only half the battle. The finish you pick can dramatically change the look and durability.",
                imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=400',
                status: 'Published'
            },
            {
                title: 'Companion Planting: The Secret Success',
                slug: 'companion-planting-the-secret-success',
                category: 'Gardening',
                content: `
                    <h2>Maximum Yield, Minimum Pests</h2>
                    <p>Learn which plants thrive when placed together and which ones should stay far apart.</p>
                `,
                excerpt: "Learn which plants thrive when placed together and which ones should stay far apart.",
                imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=400',
                status: 'Published'
            }
        ];

        console.log('Clearing existing blog posts...');
        await connection.execute('DELETE FROM blog_posts');

        console.log('Inserting sample blog posts...');

        for (const post of posts) {
            await connection.execute(
                'INSERT INTO blog_posts (title, slug, category, content, excerpt, imageUrl, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [post.title, post.slug, post.category, post.content, post.excerpt, post.imageUrl, post.status]
            );
        }

        console.log(`Successfully seeded ${posts.length} blog posts!`);
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await connection.end();
    }
}

seed();
