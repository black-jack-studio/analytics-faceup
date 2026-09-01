/**
 * Ported from faceup-server's shared/avatarCatalog.ts + client/src/data/avatars.ts so the
 * dashboard can resolve a user's `selected_avatar_id` (Supabase `users` table) to an image.
 * Source of truth stays the game app — if it adds/renames avatars, re-sync this file and the
 * PNGs in public/avatars/ (copied from attached_assets/avatars3d/).
 */

export type AvatarCategory = 'people' | 'animals' | 'fantasy' | 'legendary' | 'mystery'
export type SkinTone = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'

const TONE_ID_SEPARATOR = '::'

interface ToneAvatar {
  kind: 'tone'
  baseId: string
  name: string
  category: AvatarCategory
  images: Record<SkinTone, string>
}

interface StaticAvatar {
  kind: 'static'
  id: string
  name: string
  category: AvatarCategory
  image: string
}

type AvatarEntry = ToneAvatar | StaticAvatar

export interface ResolvedAvatar {
  id: string
  name: string
  image: string
  category: AvatarCategory
}

function img(filename: string): string {
  return `/avatars/${filename}`
}

function tone(baseId: string, name: string, category: AvatarCategory, filePrefix: string): ToneAvatar {
  return {
    kind: 'tone',
    baseId,
    name,
    category,
    images: {
      light: img(`${filePrefix}_light.png`),
      'medium-light': img(`${filePrefix}_medium-light.png`),
      medium: img(`${filePrefix}_medium.png`),
      'medium-dark': img(`${filePrefix}_medium-dark.png`),
      dark: img(`${filePrefix}_dark.png`),
    },
  }
}

function stat(id: string, name: string, category: AvatarCategory, filename: string): StaticAvatar {
  return { kind: 'static', id, name, category, image: img(filename) }
}

const AVATAR_CATALOG: AvatarEntry[] = [
  // People
  tone('boy-3d', 'Boy', 'people', 'boy_3d'),
  tone('girl-3d', 'Girl', 'people', 'girl_3d'),
  tone('man-blonde-3d', 'Man (Blonde)', 'people', 'man_blonde_hair_3d'),
  tone('woman-blonde-3d', 'Woman (Blonde)', 'people', 'woman_blonde_hair_3d'),
  tone('man-red-3d', 'Man (Red Hair)', 'people', 'man_red_hair_3d'),
  tone('woman-red-3d', 'Woman (Red Hair)', 'people', 'woman_red_hair_3d'),
  tone('person-curly-3d', 'Person (Curly Hair)', 'people', 'person_curly_hair_3d'),
  tone('woman-curly-3d', 'Woman (Curly Hair)', 'people', 'woman_curly_hair_3d'),
  tone('man-bald-3d', 'Man (Bald)', 'people', 'man_bald_3d'),
  tone('woman-bald-3d', 'Woman (Bald)', 'people', 'woman_bald_3d'),
  tone('person-beard-3d', 'Person (Beard)', 'people', 'person_beard_3d'),
  tone('woman-beard-3d', 'Woman (Beard)', 'people', 'woman_beard_3d'),
  tone('person-white-3d', 'Person (White Hair)', 'people', 'person_white_hair_3d'),
  tone('woman-white-3d', 'Woman (White Hair)', 'people', 'woman_white_hair_3d'),
  tone('old-man-3d', 'Old Man', 'people', 'old_man_3d'),
  tone('old-woman-3d', 'Old Woman', 'people', 'old_woman_3d'),

  // Animals
  stat('fox-3d', 'Fox', 'animals', 'fox_3d.png'),
  stat('raccoon-3d', 'Raccoon', 'animals', 'raccoon_3d.png'),
  stat('monkey-3d', 'Monkey', 'animals', 'monkey_face_3d.png'),
  stat('hear-no-evil-monkey-3d', 'Hear-No-Evil Monkey', 'animals', 'hear-no-evil_monkey_3d.png'),
  stat('koala-3d', 'Koala', 'animals', 'koala_3d.png'),
  stat('panda-3d', 'Panda', 'animals', 'panda_3d.png'),
  stat('rabbit-3d', 'Rabbit', 'animals', 'rabbit_face_3d.png'),
  stat('hamster-3d', 'Hamster', 'animals', 'hamster_3d.png'),
  stat('mouse-3d', 'Mouse', 'animals', 'mouse_face_3d.png'),
  stat('horse-3d', 'Horse', 'animals', 'horse_face_3d.png'),
  stat('cow-3d', 'Cow', 'animals', 'cow_face_3d.png'),
  stat('pig-3d', 'Pig', 'animals', 'pig_face_3d.png'),
  stat('dog-3d', 'Dog', 'animals', 'dog_face_3d.png'),
  stat('frog-3d', 'Frog', 'animals', 'frog_3d.png'),
  stat('penguin-3d', 'Penguin', 'animals', 'penguin_3d.png'),
  stat('whale-3d', 'Whale', 'animals', 'spouting_whale_3d.png'),
  stat('moose-3d', 'Moose', 'animals', 'moose_3d.png'),
  stat('bear-3d', 'Bear', 'animals', 'bear_3d.png'),
  stat('polar-bear-3d', 'Polar Bear', 'animals', 'polar_bear_3d.png'),
  stat('wolf-3d', 'Wolf', 'animals', 'wolf_3d.png'),
  stat('tiger-3d', 'Tiger', 'animals', 'tiger_face_3d.png'),
  stat('lion-3d', 'Lion', 'animals', 'lion_3d.png'),
  stat('shark-3d', 'Shark', 'animals', 'shark_3d.png'),
  stat('t-rex-3d', 'T-Rex', 'animals', 't-rex_3d.png'),

  // Fantasy
  tone('mx-claus-3d', 'Mx Claus', 'fantasy', 'mx_claus_3d'),
  tone('mrs-claus-3d', 'Mrs Claus', 'fantasy', 'mrs_claus_3d'),
  stat('man-zombie-3d', 'Zombie Man', 'fantasy', 'man_zombie_3d.png'),
  stat('woman-zombie-3d', 'Zombie Woman', 'fantasy', 'woman_zombie_3d.png'),
  stat('troll-3d', 'Troll', 'fantasy', 'troll_3d.png'),
  tone('ninja-3d', 'Ninja', 'fantasy', 'ninja_3d'),
  tone('man-elf-3d', 'Man (Elf)', 'fantasy', 'man_elf_3d'),
  tone('person-elf-3d', 'Person (Elf)', 'fantasy', 'person_elf_3d'),
  tone('man-mage-3d', 'Man (Mage)', 'fantasy', 'man_mage_3d'),
  tone('woman-mage-3d', 'Woman (Mage)', 'fantasy', 'woman_mage_3d'),
  tone('man-superhero-3d', 'Man (Superhero)', 'fantasy', 'man_superhero_3d'),
  tone('woman-superhero-3d', 'Woman (Superhero)', 'fantasy', 'woman_superhero_3d'),
  tone('man-vampire-3d', 'Man (Vampire)', 'fantasy', 'man_vampire_3d'),
  tone('woman-vampire-3d', 'Woman (Vampire)', 'fantasy', 'woman_vampire_3d'),
  stat('man-genie-3d', 'Man (Genie)', 'fantasy', 'man_genie_3d.png'),
  stat('woman-genie-3d', 'Woman (Genie)', 'fantasy', 'woman_genie_3d.png'),

  // Legendary
  stat('unicorn-3d', 'Unicorn', 'legendary', 'unicorn_3d.png'),
  stat('robot-3d', 'Robot', 'legendary', 'robot_3d.png'),
  stat('alien-3d', 'Alien', 'legendary', 'alien_3d.png'),
  stat('eye-3d', 'Eye', 'legendary', 'eye_3d.png'),
  stat('moai-3d', 'Moai', 'legendary', 'moai_3d.png'),
  stat('flying-saucer-3d', 'Flying Saucer', 'legendary', 'flying_saucer_3d.png'),
  stat('skull-3d', 'Skull', 'legendary', 'skull_3d.png'),
  stat('teddy-bear-3d', 'Teddy Bear', 'legendary', 'teddy_bear_3d.png'),

  // Mystery
  stat('snowman-3d', 'Snowman', 'mystery', 'snowman_without_snow_3d.png'),
  stat('ghost-3d', 'Ghost', 'mystery', 'ghost_3d.png'),
  stat('jack-o-lantern-3d', 'Jack-o-Lantern', 'mystery', 'jack-o-lantern_3d.png'),
  stat('pile-of-poo-3d', 'Pile of Poo', 'mystery', 'pile_of_poo_3d.png'),
  stat('alien-monster-3d', 'Alien Monster', 'mystery', 'alien_monster_3d.png'),
  stat('clown-face-3d', 'Clown Face', 'mystery', 'clown_face_3d.png'),
  stat('french-fries-3d', 'French Fries', 'mystery', 'french_fries_3d.png'),
  stat('hamburger-3d', 'Hamburger', 'mystery', 'hamburger_3d.png'),
  stat('hot-dog-3d', 'Hot Dog', 'mystery', 'hot_dog_3d.png'),
  stat('mirror-ball-3d', 'Mirror Ball', 'mystery', 'mirror_ball_3d.png'),
  stat('nazar-amulet-3d', 'Nazar Amulet', 'mystery', 'nazar_amulet_3d.png'),
  stat('pizza-3d', 'Pizza', 'mystery', 'pizza_3d.png'),
  stat('pool-8-ball-3d', '8 Ball', 'mystery', 'pool_8_ball_3d.png'),
  stat('rocket-3d', 'Rocket', 'mystery', 'rocket_3d.png'),
]

const DEFAULT_TONE_AVATAR = AVATAR_CATALOG[0] as ToneAvatar

/**
 * Resolves a `users.selected_avatar_id` value to an image URL.
 * Handles the tone-suffixed form (`boy-3d::medium`), plain static ids, and the DB default
 * (`face-with-tears-of-joy`, an emoji id with no matching image) by falling back to the
 * catalog's default avatar rather than showing a broken image.
 */
export function getAvatarById(id: string | undefined | null): ResolvedAvatar {
  if (id?.includes(TONE_ID_SEPARATOR)) {
    const [baseId, wantedTone] = id.split(TONE_ID_SEPARATOR) as [string, SkinTone]
    const entry = AVATAR_CATALOG.find((a): a is ToneAvatar => a.kind === 'tone' && a.baseId === baseId)
    if (entry) {
      const image = entry.images[wantedTone] ?? entry.images.medium
      return { id, name: entry.name, image, category: entry.category }
    }
  } else if (id) {
    const entry = AVATAR_CATALOG.find((a): a is StaticAvatar => a.kind === 'static' && a.id === id)
    if (entry) return { id, name: entry.name, image: entry.image, category: entry.category }
  }

  return {
    id: 'default',
    name: DEFAULT_TONE_AVATAR.name,
    image: DEFAULT_TONE_AVATAR.images.medium,
    category: DEFAULT_TONE_AVATAR.category,
  }
}
