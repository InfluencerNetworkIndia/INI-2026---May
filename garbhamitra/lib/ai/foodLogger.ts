import Anthropic from '@anthropic-ai/sdk'
import { getFoodLoggingPrompt } from './prompts'
import type { Profile, DailySummary, NutritionTargets } from '@/types'
import type { TargetValues } from '@/lib/nutrition/targets'

export type ParsedFoodData = {
  name: string
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'drink'
  quantity: number
  quantity_unit: string
  source: 'homemade' | 'restaurant' | 'packaged'
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  iron_mg: number
  calcium_mg: number
  folate_mcg: number
  b12_mcg: number
  hydration_ml: number
  pregnancy_safe: 'safe' | 'moderate' | 'avoid'
  safety_note?: string
}

export type FoodLoggerResponse = {
  status: 'clarifying' | 'logged' | 'flagged' | 'error'
  message: string
  clarifying_question?: string
  food_data?: ParsedFoodData
}

type MessageParam = Anthropic.MessageParam
type Targets = NutritionTargets | TargetValues

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export class FoodLogger {
  conversationHistory: MessageParam[] = []
  private profile: Profile
  private targets: Targets
  private todaySummary: DailySummary | null

  constructor(
    profile: Profile,
    targets: Targets,
    todaySummary: DailySummary | null,
    initialHistory: MessageParam[] = []
  ) {
    this.profile = profile
    this.targets = targets
    this.todaySummary = todaySummary
    this.conversationHistory = initialHistory
  }

  async processMessage(userMessage: string): Promise<FoodLoggerResponse> {
    this.conversationHistory.push({ role: 'user', content: userMessage })

    let rawContent = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        system: getFoodLoggingPrompt(this.profile, this.targets, this.todaySummary),
        messages: this.conversationHistory,
        max_tokens: 1000,
      })

      rawContent =
        response.content[0]?.type === 'text' ? response.content[0].text : ''
      this.conversationHistory.push({ role: 'assistant', content: rawContent })

      // Strip markdown code fences if present
      const json = rawContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      const parsed = JSON.parse(json) as FoodLoggerResponse
      return parsed
    } catch (err) {
      // On JSON parse failure, still record assistant turn and return error
      if (rawContent && this.conversationHistory.at(-1)?.role !== 'assistant') {
        this.conversationHistory.push({ role: 'assistant', content: rawContent })
      }
      console.error('FoodLogger parse error:', err)
      return {
        status: 'error',
        message: "I'm sorry, I had trouble processing that. Could you try again?",
      }
    }
  }

  reset() {
    this.conversationHistory = []
  }
}
