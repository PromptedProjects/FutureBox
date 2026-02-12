import { listSpaces, createSpace, setSpaceData } from './space-manager';
import { createGymSpaceConfig, GYM_SEED_DATA } from './gym/gym-seed';
import { createFinanceSpaceConfig, FINANCE_SEED_DATA } from './finance/finance-seed';
import { createFaithSpaceConfig, FAITH_SEED_DATA } from './faith/faith-seed';

export async function seedDefaultSpaces(): Promise<void> {
  const existing = await listSpaces();

  // Only seed if no spaces exist yet (first launch)
  if (existing.length > 0) return;

  const seeds = [
    { config: createGymSpaceConfig(), data: GYM_SEED_DATA },
    { config: createFinanceSpaceConfig(), data: FINANCE_SEED_DATA },
    { config: createFaithSpaceConfig(), data: FAITH_SEED_DATA },
  ];

  for (const { config, data } of seeds) {
    const space = await createSpace(config);
    await setSpaceData(space.id, data);
  }
}
