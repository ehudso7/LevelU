import {
  evaluateQuality,
  calculateXp,
  applyXp,
  getStreakBonus,
  xpToNextLevel,
} from '../../lib/progression/engine';

// -------------------------------------------------------
// evaluateQuality
// -------------------------------------------------------

describe('evaluateQuality', () => {
  it('tap_done always returns standard', () => {
    expect(evaluateQuality('tap_done')).toBe('standard');
    expect(evaluateQuality('tap_done', 'some text', 'some/path')).toBe('standard');
  });

  it('short_text returns good when text >= 20 chars', () => {
    expect(evaluateQuality('short_text', 'short')).toBe('standard');
    expect(evaluateQuality('short_text', 'this is exactly twenty')).toBe('good');
    expect(evaluateQuality('short_text', 'a'.repeat(50))).toBe('good');
  });

  it('short_text returns standard for empty/null text', () => {
    expect(evaluateQuality('short_text', null)).toBe('standard');
    expect(evaluateQuality('short_text', '')).toBe('standard');
    expect(evaluateQuality('short_text', '   ')).toBe('standard');
  });

  it('photo returns good when media present', () => {
    expect(evaluateQuality('photo', null, 'path/to/photo.jpg')).toBe('good');
    expect(evaluateQuality('photo', null, null)).toBe('standard');
    expect(evaluateQuality('photo', null, '')).toBe('standard');
  });

  it('social_response follows same rules as short_text', () => {
    expect(evaluateQuality('social_response', 'hi')).toBe('standard');
    expect(evaluateQuality('social_response', 'a meaningful response!')).toBe('good');
  });

  it('photo_plus_caption: excellent if media + caption >= 50', () => {
    expect(evaluateQuality('photo_plus_caption', 'a'.repeat(50), 'path.jpg')).toBe('excellent');
  });

  it('photo_plus_caption: good if media + caption >= 10', () => {
    expect(evaluateQuality('photo_plus_caption', 'a'.repeat(10), 'path.jpg')).toBe('good');
  });

  it('photo_plus_caption: good if media only (no caption)', () => {
    expect(evaluateQuality('photo_plus_caption', null, 'path.jpg')).toBe('good');
    expect(evaluateQuality('photo_plus_caption', '', 'path.jpg')).toBe('good');
  });

  it('photo_plus_caption: standard if no media', () => {
    expect(evaluateQuality('photo_plus_caption', 'lots of text here', null)).toBe('standard');
  });
});

// -------------------------------------------------------
// getStreakBonus
// -------------------------------------------------------

describe('getStreakBonus', () => {
  it('returns 0 for streak of 0', () => {
    expect(getStreakBonus(0)).toBe(0);
  });

  it('returns 5 for streak 1-2', () => {
    expect(getStreakBonus(1)).toBe(5);
    expect(getStreakBonus(2)).toBe(5);
  });

  it('returns 10 for streak 3-6', () => {
    expect(getStreakBonus(3)).toBe(10);
    expect(getStreakBonus(6)).toBe(10);
  });

  it('returns 20 for streak 7-13', () => {
    expect(getStreakBonus(7)).toBe(20);
    expect(getStreakBonus(13)).toBe(20);
  });

  it('returns 35 for streak 14-29', () => {
    expect(getStreakBonus(14)).toBe(35);
    expect(getStreakBonus(29)).toBe(35);
  });

  it('returns 50 for streak 30+', () => {
    expect(getStreakBonus(30)).toBe(50);
    expect(getStreakBonus(100)).toBe(50);
  });
});

// -------------------------------------------------------
// xpToNextLevel
// -------------------------------------------------------

describe('xpToNextLevel', () => {
  it('level 1 requires 200 XP', () => {
    expect(xpToNextLevel(1)).toBe(200);
  });

  it('level 2 requires 250 XP', () => {
    expect(xpToNextLevel(2)).toBe(250);
  });

  it('level 5 requires 400 XP', () => {
    expect(xpToNextLevel(5)).toBe(400);
  });

  it('level 10 requires 650 XP', () => {
    expect(xpToNextLevel(10)).toBe(650);
  });

  it('increases linearly by 50 per level', () => {
    for (let level = 1; level <= 20; level++) {
      expect(xpToNextLevel(level)).toBe(200 + (level - 1) * 50);
    }
  });
});

// -------------------------------------------------------
// calculateXp
// -------------------------------------------------------

describe('calculateXp', () => {
  it('easy quest, standard quality, no streak, no bonuses', () => {
    const result = calculateXp({
      difficulty: 'easy',
      quality: 'standard',
      currentStreak: 0,
      isFirstQuestOfDay: false,
      isDailyClear: false,
    });
    expect(result.baseXp).toBe(15);
    expect(result.qualityBonus).toBe(0);
    expect(result.streakBonus).toBe(0);
    expect(result.firstQuestBonus).toBe(0);
    expect(result.dailyClearBonus).toBe(0);
    expect(result.totalXp).toBe(15);
  });

  it('medium quest = 25 base XP', () => {
    const result = calculateXp({
      difficulty: 'medium',
      quality: 'standard',
      currentStreak: 0,
      isFirstQuestOfDay: false,
      isDailyClear: false,
    });
    expect(result.baseXp).toBe(25);
    expect(result.totalXp).toBe(25);
  });

  it('hard quest = 40 base XP', () => {
    const result = calculateXp({
      difficulty: 'hard',
      quality: 'standard',
      currentStreak: 0,
      isFirstQuestOfDay: false,
      isDailyClear: false,
    });
    expect(result.baseXp).toBe(40);
    expect(result.totalXp).toBe(40);
  });

  it('good quality adds +3', () => {
    const result = calculateXp({
      difficulty: 'easy',
      quality: 'good',
      currentStreak: 0,
      isFirstQuestOfDay: false,
      isDailyClear: false,
    });
    expect(result.qualityBonus).toBe(3);
    expect(result.totalXp).toBe(18);
  });

  it('excellent quality adds +5', () => {
    const result = calculateXp({
      difficulty: 'easy',
      quality: 'excellent',
      currentStreak: 0,
      isFirstQuestOfDay: false,
      isDailyClear: false,
    });
    expect(result.qualityBonus).toBe(5);
    expect(result.totalXp).toBe(20);
  });

  it('first quest of day adds +5', () => {
    const result = calculateXp({
      difficulty: 'easy',
      quality: 'standard',
      currentStreak: 0,
      isFirstQuestOfDay: true,
      isDailyClear: false,
    });
    expect(result.firstQuestBonus).toBe(5);
    expect(result.totalXp).toBe(20);
  });

  it('daily clear adds +10', () => {
    const result = calculateXp({
      difficulty: 'easy',
      quality: 'standard',
      currentStreak: 0,
      isFirstQuestOfDay: false,
      isDailyClear: true,
    });
    expect(result.dailyClearBonus).toBe(10);
    expect(result.totalXp).toBe(25);
  });

  it('all bonuses stack correctly', () => {
    const result = calculateXp({
      difficulty: 'hard',
      quality: 'excellent',
      currentStreak: 7,
      isFirstQuestOfDay: true,
      isDailyClear: true,
    });
    // 40 + 5 + 20 + 5 + 10 = 80
    expect(result.baseXp).toBe(40);
    expect(result.qualityBonus).toBe(5);
    expect(result.streakBonus).toBe(20);
    expect(result.firstQuestBonus).toBe(5);
    expect(result.dailyClearBonus).toBe(10);
    expect(result.totalXp).toBe(80);
  });

  it('unknown difficulty defaults to 15 XP', () => {
    const result = calculateXp({
      difficulty: 'legendary',
      quality: 'standard',
      currentStreak: 0,
      isFirstQuestOfDay: false,
      isDailyClear: false,
    });
    expect(result.baseXp).toBe(15);
  });
});

// -------------------------------------------------------
// applyXp / Level-up
// -------------------------------------------------------

describe('applyXp', () => {
  it('adds XP without level up', () => {
    const result = applyXp(0, 1, 200, 50);
    expect(result.newXp).toBe(50);
    expect(result.newLevel).toBe(1);
    expect(result.newXpToNext).toBe(200);
    expect(result.leveledUp).toBe(false);
  });

  it('triggers level up at exactly threshold', () => {
    const result = applyXp(199, 1, 200, 1);
    expect(result.newXp).toBe(0);
    expect(result.newLevel).toBe(2);
    expect(result.newXpToNext).toBe(250);
    expect(result.leveledUp).toBe(true);
  });

  it('carries over excess XP after level up', () => {
    const result = applyXp(190, 1, 200, 30);
    // 190 + 30 = 220, level up at 200, carry 20
    expect(result.newXp).toBe(20);
    expect(result.newLevel).toBe(2);
    expect(result.leveledUp).toBe(true);
  });

  it('handles double level up', () => {
    // Level 1: 200 XP needed. Level 2: 250 XP needed.
    // Start at 0/200, add 500
    // 500 >= 200 → level 2, xp = 300
    // 300 >= 250 → level 3, xp = 50
    const result = applyXp(0, 1, 200, 500);
    expect(result.newLevel).toBe(3);
    expect(result.newXp).toBe(50);
    expect(result.newXpToNext).toBe(300); // 200 + (3-1)*50
    expect(result.leveledUp).toBe(true);
  });

  it('handles zero XP grant', () => {
    const result = applyXp(100, 3, 300, 0);
    expect(result.newXp).toBe(100);
    expect(result.newLevel).toBe(3);
    expect(result.leveledUp).toBe(false);
  });
});
