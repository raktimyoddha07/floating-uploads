import fs from 'fs';
import path from 'path';

const PRISMA_DIR = path.join(process.cwd(), 'prisma');
const SCHEMA_DIR = path.join(PRISMA_DIR, 'schema');
const OUTPUT_FILE = path.join(PRISMA_DIR, 'schema.prisma');

function getFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.prisma')) {
      results.push(file);
    }
  });
  return results;
}

function mergePrismaFiles() {
  console.log('Merging Prisma schema files...');
  
  if (!fs.existsSync(SCHEMA_DIR)) {
    console.error(`Error: Schema directory not found at ${SCHEMA_DIR}`);
    process.exit(1);
  }

  // Define order of directories
  const directories = ['base', 'enums', 'models', 'relations'];
  let mergedContent = '// This file is auto-generated. Do not edit directly.\n\n';

  for (const dirName of directories) {
    const dirPath = path.join(SCHEMA_DIR, dirName);
    if (fs.existsSync(dirPath)) {
      const files = getFiles(dirPath);
      for (const file of files) {
        console.log(`Reading ${path.relative(process.cwd(), file)}`);
        const content = fs.readFileSync(file, 'utf-8');
        mergedContent += `// --- ${path.basename(file)} ---\n`;
        mergedContent += content + '\n\n';
      }
    }
  }

  fs.writeFileSync(OUTPUT_FILE, mergedContent);
  console.log(`Successfully merged Prisma schema into ${OUTPUT_FILE}`);
}

mergePrismaFiles();
