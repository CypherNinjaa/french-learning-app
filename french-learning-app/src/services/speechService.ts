// Speech Service for Stage 5.1 - Text-to-Speech Integration
import * as Speech from 'expo-speech';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: any) => void;
}

export interface VoiceOption {
  identifier: string;
  name: string;
  quality: string;
  language: string;
  gender?: 'male' | 'female';
}

export class SpeechService {
  private static currentSpeaking: boolean = false;

  // French language configuration
  static readonly FRENCH_LANGUAGE = 'fr-FR';
  static readonly DEFAULT_PITCH = 1.0;
  static readonly DEFAULT_RATE = 0.75; // Slightly slower for learning
  
  // Speech rate options for different learning levels
  static readonly SPEECH_RATES = {
    slow: 0.5,
    normal: 0.75,
    fast: 1.0,
    veryFast: 1.25
  };

  /**
   * Speak French text with customizable options
   */
  static async speakFrench(
    text: string, 
    options: SpeechOptions = {}
  ): Promise<void> {
    try {
      // Stop any current speech
      if (this.currentSpeaking) {
        await this.stopSpeaking();
      }

      const speechOptions: Speech.SpeechOptions = {
        language: options.language || this.FRENCH_LANGUAGE,
        pitch: options.pitch || this.DEFAULT_PITCH,
        rate: options.rate || this.DEFAULT_RATE,
        voice: options.voice,
        onStart: () => {
          this.currentSpeaking = true;
          options.onStart?.();
        },
        onDone: () => {
          this.currentSpeaking = false;
          options.onDone?.();
        },
        onStopped: () => {
          this.currentSpeaking = false;
          options.onStopped?.();
        },
        onError: (error) => {
          this.currentSpeaking = false;
          console.error('Speech error:', error);
          options.onError?.(error);
        }
      };

      await Speech.speak(text, speechOptions);
    } catch (error) {
      this.currentSpeaking = false;
      console.error('Error in speakFrench:', error);
      options.onError?.(error);
    }
  }

  /**
   * Stop current speech
   */
  static async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      this.currentSpeaking = false;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  /**
   * Check if currently speaking
   */
  static isSpeaking(): boolean {
    return this.currentSpeaking;
  }

  /**
   * Get available voices for French
   */
  static async getAvailableVoices(): Promise<VoiceOption[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      // Filter for French voices and map to our interface
      const frenchVoices: VoiceOption[] = voices
        .filter(voice => voice.language.startsWith('fr'))
        .map(voice => ({
          identifier: voice.identifier,
          name: voice.name,
          quality: voice.quality,
          language: voice.language,
          // Try to determine gender from voice name (basic heuristic)
          gender: this.determineVoiceGender(voice.name)
        }));

      return frenchVoices;
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  /**
   * Get preferred French voice (prioritize female voices for language learning)
   */
  static async getPreferredFrenchVoice(): Promise<string | undefined> {
    try {
      const voices = await this.getAvailableVoices();
      
      // Prioritize female French voices, then any French voice
      const femaleVoice = voices.find(v => v.gender === 'female');
      if (femaleVoice) return femaleVoice.identifier;
      
      const anyFrenchVoice = voices.find(v => v.language.startsWith('fr'));
      return anyFrenchVoice?.identifier;
    } catch (error) {
      console.error('Error getting preferred voice:', error);
      return undefined;
    }
  }

  /**
   * Speak vocabulary word with pronunciation
   */
  static async speakVocabulary(
    frenchWord: string,
    rate: keyof typeof SpeechService.SPEECH_RATES = 'normal',
    options: Omit<SpeechOptions, 'rate'> = {}
  ): Promise<void> {
    const speechRate = this.SPEECH_RATES[rate];
    
    await this.speakFrench(frenchWord, {
      ...options,
      rate: speechRate
    });
  }

  /**
   * Speak sentence with emphasis and pauses
   */
  static async speakSentence(
    sentence: string,
    options: SpeechOptions = {}
  ): Promise<void> {
    // Add slight pauses for better comprehension
    const enhancedSentence = sentence
      .replace(/[,;]/g, '$&,') // Add pause after commas and semicolons
      .replace(/[.!?]/g, '$&.'); // Add pause after sentence endings
    
    await this.speakFrench(enhancedSentence, {
      rate: this.SPEECH_RATES.normal,
      ...options
    });
  }

  /**
   * Spell out word letter by letter for pronunciation practice
   */
  static async spellWord(
    word: string,
    options: SpeechOptions = {}
  ): Promise<void> {
    const letters = word.toLowerCase().split('');
    const letterNames = letters.map(letter => this.getFrenchLetterName(letter));
    const spelledWord = letterNames.join(', ');
    
    await this.speakFrench(spelledWord, {
      rate: this.SPEECH_RATES.slow,
      ...options
    });
  }

  /**
   * Check if speech synthesis is available
   */
  static async isSpeechAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch (error) {
      console.error('Error checking speech availability:', error);
      return false;
    }
  }

  /**
   * Get maximum speech length (platform dependent)
   */
  static getMaxSpeechLength(): number {
    // Most platforms have a limit around 4000 characters
    return 4000;
  }

  /**
   * Split long text for speech synthesis
   */
  static splitLongText(text: string, maxLength: number = 4000): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if ((currentChunk + trimmedSentence).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // If single sentence is too long, split by words
        if (trimmedSentence.length > maxLength) {
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          for (const word of words) {
            if ((wordChunk + ' ' + word).length > maxLength) {
              if (wordChunk) {
                chunks.push(wordChunk.trim());
                wordChunk = '';
              }
            }
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        } else {
          currentChunk = trimmedSentence;
        }
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Private helper methods

  /**
   * Determine voice gender from name (basic heuristic)
   */
  private static determineVoiceGender(voiceName: string): 'male' | 'female' | undefined {
    const name = voiceName.toLowerCase();
    
    // Common patterns for voice names
    const femaleIndicators = ['female', 'woman', 'marie', 'sophie', 'claire', 'amelie', 'celine'];
    const maleIndicators = ['male', 'man', 'pierre', 'jean', 'paul', 'thomas', 'nicolas'];
    
    if (femaleIndicators.some(indicator => name.includes(indicator))) {
      return 'female';
    }
    
    if (maleIndicators.some(indicator => name.includes(indicator))) {
      return 'male';
    }
    
    return undefined;
  }

  /**
   * Get French pronunciation of letter names
   */
  private static getFrenchLetterName(letter: string): string {
    const frenchLetters: { [key: string]: string } = {
      'a': 'A',
      'b': 'Bé',
      'c': 'Cé',
      'd': 'Dé',
      'e': 'E',
      'f': 'Effe',
      'g': 'Gé',
      'h': 'Ache',
      'i': 'I',
      'j': 'Ji',
      'k': 'Ka',
      'l': 'Elle',
      'm': 'Emme',
      'n': 'Enne',
      'o': 'O',
      'p': 'Pé',
      'q': 'Ku',
      'r': 'Erre',
      's': 'Esse',
      't': 'Té',
      'u': 'U',
      'v': 'Vé',
      'w': 'Double-vé',
      'x': 'Iks',
      'y': 'I grec',
      'z': 'Zède'
    };
    
    return frenchLetters[letter] || letter;
  }
}
