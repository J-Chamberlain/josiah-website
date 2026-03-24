export type ModerationResult = {
  status: 'approved' | 'pending' | 'rejected';
  source: 'rules' | 'manual';
  reason: string;
};

const BLOCKED_TERMS = ['hate speech', 'kill yourself'];
const MAX_LINKS = 4;

export function runRuleModeration(input: string): ModerationResult | null {
  const value = input.toLowerCase();
  const links = (value.match(/https?:\/\//g) || []).length;
  if (links > MAX_LINKS) {
    return { status: 'rejected', source: 'rules', reason: 'too_many_links' };
  }
  if (BLOCKED_TERMS.some((term) => value.includes(term))) {
    return { status: 'rejected', source: 'rules', reason: 'blocked_term' };
  }
  if (value.length < 4) {
    return { status: 'pending', source: 'rules', reason: 'too_short' };
  }
  return null;
}
