/**
 * Media types configuration for ESDE
 */
export const MEDIA_TYPES = [
  {
    key: 'covers',
    folder: 'covers',
    extension: '.jpg',
    accept: 'image/jpeg',
    label: 'Cover Image',
    description: 'Main cover art for the game'
  },
  {
    key: 'marquees',
    folder: 'marquees',
    extension: '.png',
    accept: 'image/png',
    label: 'Marquee (Logo)',
    description: 'Game logo, usually transparent PNG'
  },
  {
    key: 'videos',
    folder: 'videos',
    extension: '.mp4',
    accept: 'video/mp4',
    label: 'Video',
    description: 'Gameplay video or trailer'
  },
  {
    key: '3dboxes',
    folder: '3dboxes',
    extension: '.jpg',
    accept: 'image/jpeg',
    label: '3D Box',
    description: '3D render of the game box'
  },
  {
    key: 'backcovers',
    folder: 'backcovers',
    extension: '.jpg',
    accept: 'image/jpeg',
    label: 'Back Cover',
    description: 'Back of the box art'
  },
  {
    key: 'fanart',
    folder: 'fanart',
    extension: '.jpg',
    accept: 'image/jpeg',
    label: 'Fan Art',
    description: 'Fan-created artwork for the game'
  },
 
  {
    key: 'physicalmedia',
    folder: 'physicalmedia',
    extension: '.jpg',
    accept: 'image/jpeg',
    label: 'Physical Media',
    description: 'Image of the actual physical media (cartridge, disc, etc.)'
  },
  {
    key: 'screenshots',
    folder: 'screenshots',
    extension: '.jpg',
    accept: 'image/jpeg',
    label: 'Screenshot',
    description: 'In-game screenshot'
  },
  {
    key: 'titlescreens',
    folder: 'titlescreens',
    extension: '.jpg',
    accept: 'image/jpeg',
    label: 'Title Screen',
    description: 'Game title screen or menu'
  }
];

/**
 * List of supported console systems
 */
export const CONSOLES = [
  { value: 'gba', label: 'Game Boy Advance' },
  { value: 'gb', label: 'Game Boy' },
  { value: 'gbc', label: 'Game Boy Color' },
  { value: 'nes', label: 'Nintendo Entertainment System' },
  { value: 'snes', label: 'Super Nintendo' },
  { value: 'n64', label: 'Nintendo 64' },
  { value: 'gc', label: 'GameCube' },
  { value: 'wii', label: 'Nintendo Wii' },
  { value: 'wiiu', label: 'Nintendo Wii U' },
  { value: 'switch', label: 'Nintendo Switch' },
  { value: 'ps1', label: 'PlayStation' },
  { value: 'ps2', label: 'PlayStation 2' },
  { value: 'ps3', label: 'PlayStation 3' },
  { value: 'ps4', label: 'PlayStation 4' },
  { value: 'ps5', label: 'PlayStation 5' },
  { value: 'psp', label: 'PlayStation Portable' },
  { value: 'psvita', label: 'PlayStation Vita' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'xbox360', label: 'Xbox 360' },
  { value: 'xboxone', label: 'Xbox One' },
  { value: 'segamd', label: 'Sega Mega Drive/Genesis' },
  { value: 'segacd', label: 'Sega CD' },
  { value: 'saturn', label: 'Sega Saturn' },
  { value: 'dreamcast', label: 'Sega Dreamcast' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'neogeo', label: 'Neo Geo' }
]; 