import type { DailySummary, NutritionTargets, Profile } from '@/types'
import type { ParsedFoodData } from '@/lib/ai/foodLogger'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function pctStr(actual: number, target: number): string {
  return `${Math.round((actual / target) * 100)}%`
}

function needsAttention(actual: number, target: number): boolean {
  return actual < target * 0.5
}

export function formatDailySummary(
  summary: DailySummary,
  targets: NutritionTargets,
  name: string
): string {
  const cal  = `${Math.round(summary.total_calories).toLocaleString()} / ${targets.target_calories.toLocaleString()} kcal (${pctStr(summary.total_calories, targets.target_calories)})`
  const prot = `${Math.round(summary.total_protein_g)}g / ${targets.target_protein_g}g (${pctStr(summary.total_protein_g, targets.target_protein_g)})`
  const iron = `${summary.total_iron_mg.toFixed(1)}mg / ${targets.target_iron_mg}mg (${pctStr(summary.total_iron_mg, targets.target_iron_mg)})`
  const calc = `${Math.round(summary.total_calcium_mg)}mg / ${targets.target_calcium_mg}mg (${pctStr(summary.total_calcium_mg, targets.target_calcium_mg)})`
  const water = `${(summary.total_hydration_ml / 1000).toFixed(1)}L / ${(targets.target_water_ml / 1000).toFixed(1)}L (${pctStr(summary.total_hydration_ml, targets.target_water_ml)})`

  const ironLow    = needsAttention(summary.total_iron_mg, targets.target_iron_mg)
  const proteinLow = needsAttention(summary.total_protein_g, targets.target_protein_g)
  const waterLow   = needsAttention(summary.total_hydration_ml, targets.target_water_ml)

  const tips: string[] = []
  if (ironLow)    tips.push('🩸 Iron low — try palak dal or rajma with nimbu for dinner')
  if (proteinLow) tips.push('💪 Protein low — add paneer, dal, or eggs to your next meal')
  if (waterLow)   tips.push('💧 Drink more water — try coconut water or nimbu pani')

  const date = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  return [
    `🌸 ${greeting()}, ${name}!`,
    ``,
    `Today's nutrition (${date}):`,
    ``,
    `🍽 Calories: ${cal}`,
    `💪 Protein: ${prot}`,
    `🩸 Iron: ${iron}${ironLow ? ' ⚠️' : ''}`,
    `🥛 Calcium: ${calc}`,
    `💧 Water: ${water}${waterLow ? ' ⚠️' : ''}`,
    ``,
    ...(tips.length > 0 ? [tips[0], ''] : []),
    summary.pregnancy_safe_score != null
      ? `Today's score: *${summary.pregnancy_safe_score}/100* 💚`
      : '',
    ``,
    `Keep going, you're doing great! 💕`,
  ].filter(l => l !== undefined).join('\n')
}

export function formatFoodLogged(
  foodData: ParsedFoodData,
  summary: DailySummary,
  targets: NutritionTargets
): string {
  const ironPct  = pctStr(summary.total_iron_mg, targets.target_iron_mg)
  const protPct  = pctStr(summary.total_protein_g, targets.target_protein_g)
  const ironLow  = needsAttention(summary.total_iron_mg, targets.target_iron_mg)
  const protLow  = needsAttention(summary.total_protein_g, targets.target_protein_g)

  const lines = [
    `✅ Logged: ${foodData.quantity} ${foodData.quantity_unit} ${foodData.name}`,
    ``,
    `📊 Added: ${Math.round(foodData.calories)} kcal · ${foodData.protein_g.toFixed(1)}g protein · ${foodData.iron_mg.toFixed(1)}mg iron`,
    ``,
    `Today's progress:`,
    `💪 Protein: ${Math.round(summary.total_protein_g)}g / ${targets.target_protein_g}g (${protPct})${protLow ? ' — needs a boost!' : ' 👍'}`,
    `🩸 Iron: ${summary.total_iron_mg.toFixed(1)}mg / ${targets.target_iron_mg}mg (${ironPct})${ironLow ? ' ⚠️' : ' 👍'}`,
  ]

  if (ironLow) {
    lines.push(``, `Iron still needs a boost! A bowl of rajma at dinner will help 🌿`)
  }

  if (foodData.safety_note) {
    lines.push(``, `⚠️ Note: ${foodData.safety_note}`)
  }

  return lines.join('\n')
}

export function formatNutritionTargets(targets: NutritionTargets, profile: Profile): string {
  const trimNames: Record<number, string> = { 1: 'First', 2: 'Second', 3: 'Third' }
  const trimLabel = profile.trimester ? `${trimNames[profile.trimester]} trimester` : ''

  return [
    `🎯 Your nutrition targets (${trimLabel}):`,
    ``,
    `🍽 Calories: ${targets.target_calories.toLocaleString()} kcal/day`,
    `💪 Protein: ${targets.target_protein_g}g/day`,
    `🩸 Iron: ${targets.target_iron_mg}mg/day`,
    `🥛 Calcium: ${targets.target_calcium_mg}mg/day`,
    `💚 Folate: ${targets.target_folate_mcg}mcg/day`,
    `💧 Water: ${(targets.target_water_ml / 1000).toFixed(1)}L/day`,
    ``,
    `These are personalised for you based on your health profile 🌸`,
  ].join('\n')
}

export function formatWelcomeMessage(name: string, trimester: number): string {
  const trimNames: Record<number, string> = { 1: 'first', 2: 'second', 3: 'third' }
  return [
    `🌸 Namaste, ${name}! Welcome to GarbhaMitra!`,
    ``,
    `I'm your AI pregnancy nutrition companion. You're in your *${trimNames[trimester] ?? 'second'} trimester* — a wonderful time! 💕`,
    ``,
    `What you can do:`,
    `🍽 Log food: *"Had 2 idlis and coconut water"*`,
    `📊 See today: *"summary"* or *"aaj ka"*`,
    `🎯 See targets: *"targets"*`,
    `⚖️ Log weight: *"weight 62 kg"*`,
    `❓ Help: *"help"*`,
    ``,
    `What did you have today? 🤗`,
  ].join('\n')
}

export function formatHelpMessage(): string {
  return [
    `👋 Here's what you can say to me:`,
    ``,
    `🍽 Log food: *"Had 2 idlis and sambar"*`,
    `📊 See today: *"summary"* or *"aaj ka"*`,
    `🎯 See targets: *"targets"*`,
    `⚖️ Log weight: *"weight 62 kg"*`,
    `❓ Help: *"help"*`,
    ``,
    `I understand Hindi + English! 🇮🇳`,
    `GarbhaMitra loves you 💕`,
  ].join('\n')
}

export function formatOnboardingWelcome(): string {
  return [
    `🌸 Namaste! Welcome to GarbhaMitra — your pregnancy nutrition companion!`,
    ``,
    `Let's get you set up in 5 quick steps.`,
    ``,
    `*What's your name?*`,
  ].join('\n')
}
