import fs from 'fs';
import path from 'path';

export const cleanupFiles = async (filePaths) => {
  try {
    if (Array.isArray(filePaths)) {
      for (const filePath of filePaths) {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else if (filePaths && fs.existsSync(filePaths)) {
      fs.unlinkSync(filePaths);
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
};

export const cleanupDirectory = async (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          await cleanupDirectory(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up directory:', error);
  }
};