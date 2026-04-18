const fs = require('fs');
const path = require('path');

const routes = {
    'home': 'page.tsx',
    'product-listing': 'products/page.tsx',
    'product-details': 'products/detail/page.tsx',
    'shopping-cart': 'cart/page.tsx',
    'checkout': 'checkout/page.tsx',
    'order-confirmation': 'order-confirmation/page.tsx',
    'about-us': 'about/page.tsx',
    'contact': 'contact/page.tsx',
    'blog-listing': 'blog/page.tsx',
    'blog-article': 'blog/article/page.tsx',
    'admin-dashboard': 'admin/page.tsx',
    'admin-orders': 'admin/orders/page.tsx',
    'admin-products': 'admin/products/page.tsx'
};

const screensDir = path.join(__dirname, 'screens');
const appDir = path.join(__dirname, 'src', 'app');

function sanitizeHtmlToJsx(html) {
    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : html;

    // Replace HTML comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Replace class -> className, for -> htmlFor
    content = content.replace(/\bclass="/g, 'className="');
    content = content.replace(/\bfor="/g, 'htmlFor="');

    // Fix disabled="" attribute for JSX 
    content = content.replace(/\bdisabled=""/g, 'disabled');

    // Fix numeric attributes that React expects to be Numbers
    content = content.replace(/\brows="(\d+)"/g, 'rows={$1}');

    // Basic translation of specific known style tags in templates (background-image)
    content = content.replace(/style="background-image:\s*url\('([^']+)'\);?"/gi, "style={{ backgroundImage: `url('$1')` }}");
    content = content.replace(/style='background-image:\s*url\("([^"]+)"\);?'/gi, "style={{ backgroundImage: `url('$1')` }}");

    // Remove empty style attributes which cause JSX errors
    content = content.replace(/\bstyle=""/gi, '');

    // Fix SVG specific attributes
    content = content.replace(/\bviewbox=/gi, 'viewBox=');
    content = content.replace(/\bstroke-width=/gi, 'strokeWidth=');
    content = content.replace(/\bstroke-linecap=/gi, 'strokeLinecap=');
    content = content.replace(/\bstroke-linejoin=/gi, 'strokeLinejoin=');
    content = content.replace(/\bfill-rule=/gi, 'fillRule=');
    content = content.replace(/\bclip-rule=/gi, 'clipRule=');
    content = content.replace(/\bclip-path=/gi, 'clipPath=');
    content = content.replace(/\bstroke-miterlimit=/gi, 'strokeMiterlimit=');

    // Regex to clean up self-closing tags and ensure they are properly formatted
    const selfClosingTags = ['img', 'input', 'hr', 'br', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'];
    selfClosingTags.forEach(tag => {
        // Strip out existing slashes before > 
        const cleanRegex = new RegExp("<" + tag + "([^>]*?)/?\\s*>", "gi");
        content = content.replace(cleanRegex, "<" + tag + "$1>");
        // Ensure standard />
        const finalRegex = new RegExp("<" + tag + "([^>]*?)>", "gi");
        content = content.replace(finalRegex, "<" + tag + "$1 />");
    });

    // Handle path separately
    content = content.replace(/<path([^>]*?)\/?\s*>([\s\S]*?)<\/path>/gi, "<path$1 />");
    // Some paths might be self-closed already without </path>
    const cleanPath = new RegExp("<path([^>]*?)/?\\s*>", "gi");
    content = content.replace(cleanPath, "<path$1>");
    const finalPath = new RegExp("<path([^>]*?)>", "gi");
    content = content.replace(finalPath, "<path$1 />");

    return content;
}

if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
}

Object.keys(routes).forEach(key => {
    const htmlFile = path.join(screensDir, `${key}.html`);
    if (!fs.existsSync(htmlFile)) {
        console.log(`Skipping ${key}, file not found`);
        return;
    }

    const rawHtml = fs.readFileSync(htmlFile, 'utf8');
    let jsxContent = sanitizeHtmlToJsx(rawHtml);

    const outPath = path.join(appDir, routes[key]);
    const outDir = path.dirname(outPath);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const componentName = key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Page';

    const template = `
export default function ${componentName}() {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

    fs.writeFileSync(outPath, template);
    console.log(`Generated ${routes[key]} from ${key}.html`);
});
