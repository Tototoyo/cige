/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Part} from '@google/genai';
import React, {useEffect, useState} from 'react';
import {AnimateImagePage} from './components/AnimateImagePage';
import {ErrorModal} from './components/ErrorModal';
import {GeneratedImageModal} from './components/GeneratedImageModal';
import {SavingProgressPage} from './components/SavingProgressPage';
import {VideoPlayer} from './components/VideoPlayer';
import {useAuth} from './contexts/AuthContext';
import {ExplainerInputs, KineticTypographyInputs, LogoInputs, PromptFormat, StoryboardInputs, Video, YouTubeIntroInputs} from './types';
import {trackEvent} from './utils/analytics';
import {saveToHistory} from './utils/history';

const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_API_KEY});

const NO_TEXT_INSTRUCTION = `
**CRITICAL NO-TEXT RULE:** The user has explicitly disabled text generation. You MUST NOT include any descriptions of on-screen text, text overlays, typography, letters, words, captions, or fonts in your JSON output. All concepts must be represented purely visually. For example, instead of a sign that reads "OPEN", describe a door swinging open with light pouring out. Instead of a title card, create a symbolic visual. This is a strict, non-negotiable instruction. Any violation will result in a failed output.`;

const DETAILED_CINEMATIC_SYSTEM_INSTRUCTION = `You are a master prompt engineer for a state-of-the-art video generation AI. Your task is to convert user specifications into a structured JSON array.

**CRITICAL INSTRUCTIONS:**
1.  **JSON Array Output ONLY:** Your entire response MUST be a single, valid JSON array. Each object in the array represents a single, distinct shot/scene. Do not include any text or markdown formatting (like \`\`\`json\`) before or after the JSON.
2.  **Hyper-Clear Text & Overlays:** When user input requires text on screen (e.g., taglines, titles, labels), you MUST describe it with extreme clarity in the \`description\` field to ensure correct rendering. This is a critical step to avoid garbled or incorrect text.
    - **Use Quotation Marks:** Always wrap the exact text to be displayed in double quotes. For example: \`A text overlay appears reading: "Your Text Here"\`.
    - **Specify Style and Placement:** Clearly describe the font (e.g., "bold sans-serif font"), color, and on-screen position (e.g., "in the lower-third", "centered on a wooden sign").
    - **Specify Animation:** Detail how the text animates (e.g., "it fades in gently", "it types onto the screen").
3.  **Adhere to Schema:** Each object in the array must strictly follow this JSON schema. DO NOT add extra fields or deviate from the structure.
    - \`description\` (string): A single, consolidated, highly detailed cinematic prompt for the video AI, describing everything in the shot. This should be a complete paragraph.
    - \`shot\` (object): Contains camera and shot details.
        - \`composition\` (string): e.g., "wide and medium-wide group shots".
        - \`camera_motion\` (string): e.g., "smooth dolly left-to-right".
        - \`frame_rate\` (string): e.g., "30fps".
        - \`lens\` (string): e.g., "24mm wide-angle".
        - \`depth_of_field\` (string): e.g., "sharp across group, soft background bokeh".
        - \`film_grain\` (string): e.g., "none" or "light 16mm".
        - \`duration\` (string): e.g., "8s".
    - \`scene\` (object): Contains environment details.
        - \`environment\` (string): Description of the setting.
        - \`lighting\` (object): Describes the lighting.
            - \`key\` (string)
            - \`fill\` (string)
            - \`accent\` (string)
        - \`props\` (array of strings)
    - \`characters\` (array of objects): Describes characters.
        - \`group\` (string, optional): For groups of characters, e.g., "25+ enthusiastic college sorority girls".
        - \`position\` (string, optional): For single characters, e.g., "center".
        - \`appearance\` (string, optional): For single characters.
        - \`wardrobe\` (string)
        - \`movement\` (array of objects): Timed actions.
            - \`start\` (number): start time in seconds.
            - \`end\` (number): end time in seconds.
            - \`action\` (string)
    - \`audio\` (object): Describes audio elements.
        - \`music\` (object, optional):
            - \`track\` (string)
            - \`segment\` (string)
            - \`timing\` (string)
        - \`fx\` (array of strings)
        - \`ambient\` (string, optional)
        - \`voice\` (string, optional): For voiceovers or dialogue.
    - \`visual_rules\` (object):
        - \`style\` (string): e.g., "cinematic TikTok choreography".
        - \`physics\` (string): e.g., "realistic synchronized group movement".
        - \`vibe\` (string): e.g., "high-energy, empowering, joyful".
`;

const HAILUO_COMPACT_SYSTEM_INSTRUCTION = `You are a world-class film director and AI prompt engineer, specializing in creating hyper-detailed, single-object JSON prompts for advanced video generation models like Hailuo AI. Your goal is to produce a single, comprehensive JSON object that acts as a complete blueprint for a short video, meticulously detailed yet concise enough to fit within a 2000-character limit.

**CRITICAL INSTRUCTIONS:**
1.  **Single Compact JSON Object ONLY:** Your entire response MUST be a single, valid JSON object, NOT an array. Do not include any markdown formatting (like \`\`\`json\`).
2.  **TOTAL CHARACTER LIMIT: 2000 characters.** The entire JSON string must not exceed this limit. Be ruthlessly efficient with your language.
3.  **Holistic \`description\`:** The \`description\` field should be a compelling, cinematic paragraph that provides a narrative overview of the entire video. It should capture the essence of the story, mood, and key visual moments.
4.  **Hyper-Clear Text & Overlays:** To prevent garbled text, any on-screen text MUST be described with extreme clarity within the main \`description\` field.
    - **Use Quotation Marks:** Always enclose the exact text in double quotes.
    - **Specify Style:** Describe the font, color, and on-screen position.
    - **Integrate Smoothly:** Weave these details naturally into the cinematic paragraph. Example: "...as the logo settles, a text overlay 'Innovate. Create. Inspire.' fades in below it in a sleek, white serif font."
5.  **Granular Field Detailing:** This is crucial. You must populate the nested objects (\`shot\`, \`scene\`, \`characters\`, \`audio\`, \`visual_rules\`) with rich, specific, professional cinematic details. These fields are for precise instructions, not just keywords.
    - **\`shot\`:** Detail \`composition\`, \`camera_motion\` (e.g., "slow dolly-in with subtle gimbal stabilization"), \`lens\`, \`depth_of_field\`, etc.
    - **\`scene\`:** Describe the \`environment\` and specify \`lighting\` with \`key\`, \`fill\`, and \`accent\` lights. List key \`props\`.
    - **\`characters\`:** Describe the \`group\` or \`appearance\`, their \`wardrobe\`, and provide a sequence of timed \`movement\`.
    - **\`audio\`:** Specify \`music\`, sound \`fx\`, and \`ambient\` sounds.
    - **\`visual_rules\`:** Define the overall \`style\`, \`physics\`, and \`vibe\`.
6.  **Synthesize & Balance:** Combine all elements of the user's request into this single, cohesive JSON object. Balance the detail between the \`description\` and the other fields to create the most effective and complete prompt possible within the character limit.`;


async function generateImage(
  prompt: string,
  aspectRatio: '16:9' | '4:3' = '16:9',
  imageFile: File | null = null,
  includeTextOnImage = true,
): Promise<string> {
  // Note: The `imageFile` parameter is not used in this function as `generateImages`
  // only accepts a string prompt.
  const finalPrompt = includeTextOnImage
    ? prompt
    : `${prompt}, photorealistic, high detail, text-free, no text, no writing, no letters, no words, no typography, no fonts`;

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: finalPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio,
    },
  });

  const image = response.generatedImages?.[0]?.image?.imageBytes;
  if (!image) {
    throw new Error('No images generated from prompt.');
  }
  return image;
}

async function analyzeImageStyle(imageFile: File): Promise<string> {
  const imagePart = {
    inlineData: {
      mimeType: imageFile.type,
      data: await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      }),
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          text: `You are a master art director creating a prompt for an AI image generator. Based on the provided image, describe its visual style using a concise, comma-separated list of keywords. Focus on mood, color palette, lighting, and key artistic characteristics.`,
        },
        imagePart,
      ],
    },
  });
  return response.text;
}

/**
 * Main component for the app.
 * It manages the state for animating images and displaying the results.
 */
export const App: React.FC = () => {
  const {user} = useAuth();
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingTitle, setSavingTitle] = useState('Generating your scene...');
  const [generationError, setGenerationError] = useState<string[] | null>(
    null,
  );
  const [generatedResult, setGeneratedResult] = useState<{
    imageSrc: string;
    prompt: string;
  } | null>(null);

  useEffect(() => {
    if (generationError) {
      trackEvent('generation_error', {
        error_message: generationError.join(' | '),
      });
    }
  }, [generationError]);

  const handleClosePlayer = () => {
    setPlayingVideo(null);
  };

  const handleGenerateLogoPrompt = async (
    logoFile: File,
    animationStyle: string,
    background: string,
    sfx: string,
    tagline: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ): Promise<string> => {
    const detailedSystemInstructionBase = `${DETAILED_CINEMATIC_SYSTEM_INSTRUCTION}

You are a senior motion graphics director. Your task is to take user specs and a logo image and write a JSON array of detailed, individual shot prompts for an 8-second animation.
Generate a self-contained JSON object for EACH logical animation segment (e.g., Intro, Reveal, Tagline, Outro). Each segment should be ~2 seconds.
Reference the user's uploaded logo as 'the provided logo image' in your descriptions.
Be highly descriptive and use professional filmmaking terminology. The prompts must be heavily influenced by the user's selected animation style.`;
    
    const compactSystemInstructionBase = `${HAILUO_COMPACT_SYSTEM_INSTRUCTION}

You are a senior motion graphics director. Condense the user's request for an 8-second logo animation into a single, compact JSON object. The 'description' should capture the full animation flow, and all other fields should be populated with rich, specific detail.`;

    let detailedSystemInstruction = detailedSystemInstructionBase;
    let compactSystemInstruction = compactSystemInstructionBase;

    if (!includeTextOnImage) {
        detailedSystemInstruction += NO_TEXT_INSTRUCTION;
        compactSystemInstruction += NO_TEXT_INSTRUCTION;
    }

    const systemInstruction = promptFormat === 'hailuo-compact' ? compactSystemInstruction : detailedSystemInstruction;

    const promptText = `
      Create a logo animation prompt series based on these details:
      - Animation Style: ${animationStyle}
      - Background Description: ${background}
      - Sound Effects (SFX) Description: ${sfx}
      - Tagline (optional): ${!includeTextOnImage ? 'None. IMPORTANT: Do not add any text overlays.' : (tagline || 'None')}
    `;

    const logoImagePart = {
      inlineData: {
        mimeType: logoFile.type,
        data: await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        }),
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {parts: [{text: promptText}, logoImagePart]},
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let promptResult = response.text;
    try {
      const parsed = JSON.parse(promptResult);
      promptResult = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // Ignore if not valid JSON
    }


    // Save to history
    saveToHistory(
      {
        type: 'logo',
        title: `Logo Animation: ${logoFile.name}`,
        prompt: promptResult,
        inputs: {
          animationStyle,
          background,
          sfx,
          tagline,
        } as LogoInputs,
      },
      user?.email,
    );

    return promptResult;
  };

  const handleGenerateYouTubeIntroPrompt = async (
    channelName: string,
    videoTopic: string,
    visualStyle: string,
    energy: string,
    specificElements: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ): Promise<string> => {
    const detailedSystemInstructionBase = `${DETAILED_CINEMATIC_SYSTEM_INSTRUCTION}

You are a YouTube branding expert and motion graphics director. Your job is to create a JSON array of dynamic, individual shot prompts for a 5-8 second YouTube intro, broken into logical 2-3 second segments.
Generate a self-contained JSON object for EACH logical intro segment (e.g., Buildup, Reveal, CTA).
Use exciting, descriptive, professional filmmaking language. The detail should match the user's specified energy level.
The prompts must revolve around the user's Channel Name and Topic.`;
    
    const compactSystemInstructionBase = `${HAILUO_COMPACT_SYSTEM_INSTRUCTION}

You are a YouTube branding expert. Condense the user's request for a 5-8 second YouTube intro into a single, compact JSON object. The 'description' must capture the entire intro sequence, and all other fields must be populated with rich, specific detail.`;
    
    let detailedSystemInstruction = detailedSystemInstructionBase;
    let compactSystemInstruction = compactSystemInstructionBase;

    if (!includeTextOnImage) {
        detailedSystemInstruction += NO_TEXT_INSTRUCTION;
        compactSystemInstruction += NO_TEXT_INSTRUCTION;
    }

    const systemInstruction = promptFormat === 'hailuo-compact' ? compactSystemInstruction : detailedSystemInstruction;

    const promptText = `
      Create a YouTube intro prompt series with the following specifications:
      - Channel Name: ${channelName}
      - Video Topic/Theme: ${videoTopic}
      - Visual Style: ${visualStyle}
      - Energy Level: ${energy}
      - Specific Elements to Include: ${specificElements}
      ${!includeTextOnImage ? '- CRITICAL: Do not render the Channel Name or other specific elements as literal on-screen text. Represent them visually and symbolically.' : ''}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {parts: [{text: promptText}]},
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let promptResult = response.text;
    try {
        const parsed = JSON.parse(promptResult);
        promptResult = JSON.stringify(parsed, null, 2);
    } catch(e) {
        // ignore if not valid JSON
    }

    // Save to history
    saveToHistory(
      {
        type: 'introOutro',
        title: `Intro: ${channelName}`,
        prompt: promptResult,
        inputs: {
          channelName,
          videoTopic,
          visualStyle,
          energy,
          specificElements,
        } as YouTubeIntroInputs,
      },
      user?.email,
    );

    return promptResult;
  };

  const handleGenerateSceneDescriptions = async (
    generalIdea: string,
    sceneCount: number,
  ): Promise<string[]> => {
    const systemInstruction = `You are a master storyteller and narrative designer. Your task is to take a user's general idea and break it down into a specific number of distinct, compelling scene descriptions.

    **CRITICAL INSTRUCTIONS:**
    1.  **JSON Output ONLY:** Your entire response MUST be a single, valid JSON object. Do not include any text or markdown formatting (like \`\`\`json\`) before or after the JSON.
    2.  **Strict Schema:** The JSON object must have a single key: "scenes". The value of "scenes" must be an array of strings.
    3.  **Scene Count:** The number of strings in the "scenes" array must exactly match the user's requested 'Number of Scenes'.
    4.  **Narrative Arc:** Create a logical flow across the scenes. Think about a beginning, middle, and end, even for a short sequence.
    5.  **Cinematic & Descriptive:** Each scene description should be concise but evocative. Describe the subject, action, and setting. For example, instead of "man walks in rain", write "A lone detective in a drenched trench coat hurries down a neon-lit, rain-slicked alley."`;

    const promptText = `
      General Idea: "${generalIdea}"
      Number of Scenes: ${sceneCount}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {parts: [{text: promptText}]},
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(response.text);
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        return parsed.scenes;
      }
      throw new Error('Invalid response format from AI.');
    } catch (e) {
      console.error('Failed to parse scene descriptions from AI', e);
      throw new Error('Could not generate scene descriptions.');
    }
  };

  const handleGenerateStoryboard = async (
    scenes: {description: string; shotCount: number}[],
    imageFile: File | null,
    selectedStyle: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
    generateVisuals: boolean,
  ): Promise<{prompts: string; sceneImages: (string | null)[]}> => {
    setGenerationError(null);
    const nonEmptyScenes = scenes.filter((s) => s.description.trim());

    if (nonEmptyScenes.length === 0) {
      const errorMsg = 'Please add at least one scene to the storyboard.';
      setGenerationError([errorMsg]);
      throw new Error(errorMsg);
    }

    try {
      // Step 1: Create a unified style guide
      let styleGuide =
        selectedStyle !== 'No Style'
          ? `Cinematic Style: ${selectedStyle}.`
          : 'No specific cinematic style has been selected; rely on the reference image (if provided) and scene descriptions for style cues.';
      let imageStyleKeywords = '';
      if (imageFile) {
        try {
          const imageStyle = await analyzeImageStyle(imageFile);
          styleGuide += `\nReference Image Style: ${imageStyle}`;
          imageStyleKeywords = imageStyle;
        } catch (e) {
          console.error(
            'Failed to analyze image style, proceeding without it.',
            e,
          );
        }
      }
      // Step 2: Generate images for each scene description in parallel
      let sceneImages: (string | null)[] = scenes.map(() => null);
      if (generateVisuals) {
        const imagePromises = scenes.map((scene) => {
          if (scene.description.trim()) {
            const styleForPrompt = [
              selectedStyle !== 'No Style' ? selectedStyle : '',
              imageStyleKeywords,
            ]
              .filter(Boolean)
              .join(', ');
            const fullPrompt = `${
              styleForPrompt ? styleForPrompt + ', ' : ''
            }cinematic shot depicting ${scene.description.trim()}`;
            return generateImage(fullPrompt, '4:3', null, includeTextOnImage);
          }
          return Promise.resolve(null);
        });

        const imageResults = await Promise.allSettled(imagePromises);
        sceneImages = imageResults.map((result) => {
          if (result.status === 'fulfilled') {
            return result.value;
          }
          console.error('Failed to generate scene image:', result.reason);
          return null;
        });
      }

      // Step 3: Build the multi-modal prompt for the master prompt generation
      const promptParts: Part[] = [];
      promptParts.push({
        text: `Based on the following storyboard scenes (text and images), and adhering to the specified cinematic and technical guidance, create a JSON array of detailed shot prompts.`,
      });
      promptParts.push({text: `--- STYLE GUIDANCE ---\n${styleGuide}`});

      nonEmptyScenes.forEach((scene, index) => {
        if (scene.description.trim()) {
          promptParts.push({
            text: `--- Scene ${index + 1} ---
Description: ${scene.description.trim()}
Number of Shots to Generate for this Scene: ${promptFormat === 'hailuo-compact' ? 1 : scene.shotCount}`,
          });

          if (generateVisuals) {
            const imageBase64 = sceneImages[index];
            if (imageBase64) {
              promptParts.push({
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64,
                },
              });
            }
          }
        }
      });

      // Step 4: Generate the master prompt using text and images
      const detailedSystemInstructionBase = `${DETAILED_CINEMATIC_SYSTEM_INSTRUCTION}

You are a world-class film director. Your task is to take a storyboard (which includes scene descriptions, shot counts, reference images, and a style guide) and create a JSON array of powerful, detailed shot prompts.
For EACH scene provided by the user, you MUST generate the exact number of JSON objects specified in the 'Number of Shots to Generate for this Scene' field. Each JSON object represents one shot. If a scene has a shot count of 3, you will generate 3 separate JSON objects for that single scene description, each from a different cinematic perspective.
Integrate the style from the Style Guide and reference images.
The 'description' field in each JSON object should be a detailed, cinematic paragraph based on the user's scene description and the provided visual references.`;
      
      const compactSystemInstructionBase = `${HAILUO_COMPACT_SYSTEM_INSTRUCTION}

You are a world-class film director. Your task is to take a storyboard (scenes, images, style guide) and synthesize it into a SINGLE, compact JSON object representing one continuous video.
The 'description' field MUST combine all scenes into one flowing cinematic paragraph. All other fields must be populated with rich, specific detail.
Integrate the style from the Style Guide and reference images.`;

      let detailedSystemInstruction = detailedSystemInstructionBase;
      let compactSystemInstruction = compactSystemInstructionBase;

      if (!includeTextOnImage) {
        detailedSystemInstruction += NO_TEXT_INSTRUCTION;
        compactSystemInstruction += NO_TEXT_INSTRUCTION;
      }

      const systemInstruction = promptFormat === 'hailuo-compact' ? compactSystemInstruction : detailedSystemInstruction;

      const masterPromptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {parts: promptParts},
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      let promptText = masterPromptResponse.text;
      
      try {
        // Parse and pretty-print the JSON to ensure it's valid and readable
        const parsedJson = JSON.parse(promptText);
        promptText = JSON.stringify(parsedJson, null, 2);
      } catch (e) {
        console.error(
          'Failed to parse AI response as JSON, returning raw text.',
          e,
        );
        // If parsing fails, we'll just return the raw text. The user might be able to fix it.
      }


      const prompts = promptText;

      // Save to history
      saveToHistory(
        {
          type: 'storyboard',
          title: `Storyboard: ${nonEmptyScenes[0]?.description ?? 'Untitled'}`,
          prompt: prompts,
          visuals: sceneImages,
          inputs: {
            scenes: nonEmptyScenes,
            selectedStyleName: selectedStyle,
          } as StoryboardInputs,
        },
        user?.email,
      );

      return {prompts, sceneImages};
    } catch (e) {
      console.error('Failed to generate storyboard', e);
      setGenerationError([
        'Failed to generate storyboard.',
        'Please check your connection or API key and try again.',
      ]);
      throw new Error('Could not generate storyboard.');
    }
  };

  const handleGenerateNextScene = async (
    existingMasterPrompt: string,
    existingVisuals: (string | null)[],
    existingScenes: string[],
    styleImageFile: File | null,
    selectedStyleName: string,
    includeTextOnImage: boolean,
  ): Promise<{
    newSceneDescription: string;
    newScenePrompt: object;
    newVisual: string | null;
  }> => {
    let systemInstruction = `You are a master storyteller and film director continuing a narrative. Your task is to generate the *very next* logical scene for the provided story. You MUST maintain absolute consistency with the characters, plot, tone, and visual style established in the previous scenes.

**CRITICAL INSTRUCTIONS:**
1.  **JSON Object Output ONLY:** Your entire response MUST be a single, valid JSON object. Do not include any text or markdown formatting.
2.  **Adhere to Schema:** The JSON object must have TWO top-level keys:
    - \`newSceneDescription\` (string): A concise, one-sentence text description for the new scene (e.g., "The detective finds a mysterious key on the table.").
    - \`newScenePrompt\` (object): A full, detailed JSON prompt object for the new scene. This object must strictly follow the established prompt schema (with shot, scene, characters, etc.).
3.  **Analyze Context:** Carefully analyze the provided style guide, the sequence of text descriptions, the reference images for each scene, and the existing JSON director's prompts to understand the story's trajectory and visual language.
4.  **Generate Continuation:** Create a scene that logically follows what has come before.`;

    if (!includeTextOnImage) {
        systemInstruction += NO_TEXT_INSTRUCTION;
    }

    let styleGuide =
      selectedStyleName !== 'No Style'
        ? `Cinematic Style: ${selectedStyleName}.`
        : 'No specific cinematic style has been selected; rely on the reference image (if provided) and scene descriptions for style cues.';
    let imageStyleKeywords = '';
    if (styleImageFile) {
      try {
        const imageStyle = await analyzeImageStyle(styleImageFile);
        styleGuide += `\nReference Image Style: ${imageStyle}`;
        imageStyleKeywords = imageStyle;
      } catch (e) {
        console.error('Failed to analyze style image for next scene', e);
      }
    }

    const promptParts: Part[] = [];
    promptParts.push({text: `--- STYLE GUIDANCE ---\n${styleGuide}`});
    promptParts.push({text: `--- EXISTING SCENES & VISUALS ---`});
    existingScenes.forEach((scene, index) => {
      if (scene.trim()) {
        promptParts.push({text: `Scene ${index + 1} Description: ${scene.trim()}`});
        const imageBase64 = existingVisuals[index];
        if (imageBase64) {
          promptParts.push({
            inlineData: {mimeType: 'image/jpeg', data: imageBase64},
          });
        }
      }
    });
    promptParts.push({text: `--- EXISTING DIRECTOR'S PROMPTS (JSON) ---`});
    promptParts.push({text: existingMasterPrompt});
    promptParts.push({
      text: `--- INSTRUCTION --- \nBased on all the context above, generate the next logical scene.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {parts: promptParts},
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text);
    const {newSceneDescription, newScenePrompt} = result;

    if (!newSceneDescription || !newScenePrompt) {
      throw new Error('AI did not return the expected new scene structure.');
    }

    const styleForImage = [
      selectedStyleName !== 'No Style' ? selectedStyleName : '',
      imageStyleKeywords,
    ]
      .filter(Boolean)
      .join(', ');
    const fullPromptForImage = `${
      styleForImage ? styleForImage + ', ' : ''
    }cinematic shot depicting ${newSceneDescription.trim()}`;
    const newVisual = await generateImage(
      fullPromptForImage,
      '4:3',
      null,
      includeTextOnImage,
    );

    return {newSceneDescription, newScenePrompt, newVisual};
  };

  const handleGenerateExplainerVideoPrompt = async (
    topic: string,
    keyPoints: string[],
    visualStyle: string,
    audience: string,
    cta: string,
    duration: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ): Promise<string> => {
    const detailedSystemInstructionBase = `${DETAILED_CINEMATIC_SYSTEM_INSTRUCTION}

You are an expert scriptwriter and AI prompt engineer. Your task is to take a topic and create a complete script for an explainer video, then convert that script into a structured JSON array of scenes for a video generation AI.

**CRITICAL INSTRUCTIONS:**
1.  **Understand & Script:** First, deeply understand the user's topic. If key points are provided, use them. If not, generate 3-5 logical key points yourself. Write a concise, engaging voiceover script that explains the topic to the specified audience, covers the key points, and fits the target duration. Include the Call to Action at the end.
2.  **Scene Breakdown:** Divide the script into logical scenes. Each scene should correspond to a small, digestible part of the voiceover.
3.  **JSON Array Output ONLY:** Your entire response MUST be a single, valid JSON array. Each object in the array represents one scene.
4.  **Voiceover:** Populate the \`audio.voice\` field for each scene object with the corresponding part of the script you wrote.
5.  **Visuals:** For each scene, create a detailed \`description\` prompt that visually represents the voiceover content, adhering to the user's chosen visual style. Be creative and cinematic. When a key term from the voiceover should appear on screen as a text overlay, ensure it is described with extreme clarity per the main system instructions.`;
    
    const compactSystemInstructionBase = `${HAILUO_COMPACT_SYSTEM_INSTRUCTION}

You are an expert scriptwriter. Your task is to take a topic and create a single, compact JSON object for an explainer video.
1.  First, internally devise a concise voiceover script based on the user's topic and key points.
2.  Then, in the 'description' field of the JSON, write a single, flowing cinematic paragraph that describes the visuals for the *entire* video, from start to finish. All other fields should be populated with rich, specific detail.
3.  In the 'audio.voice' field, place the *complete* voiceover script you wrote.`;

    let detailedSystemInstruction = detailedSystemInstructionBase;
    let compactSystemInstruction = compactSystemInstructionBase;

    if (!includeTextOnImage) {
        detailedSystemInstruction += NO_TEXT_INSTRUCTION;
        compactSystemInstruction += NO_TEXT_INSTRUCTION;
    }

    const systemInstruction = promptFormat === 'hailuo-compact' ? compactSystemInstruction : detailedSystemInstruction;

    const promptText = `
      Create an explainer video script and prompt series with these details:
      - Topic: ${topic}
      - Key Points to Cover: ${keyPoints.length > 0 ? keyPoints.join('; ') : 'Auto-generate key points.'}
      - Visual Style: ${visualStyle}
      - Target Audience: ${audience}
      - Call to Action (CTA): ${cta}
      - Target Duration: ${duration}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {parts: [{text: promptText}]},
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let promptResult = response.text;
    try {
        const parsed = JSON.parse(promptResult);
        promptResult = JSON.stringify(parsed, null, 2);
    } catch(e) {
        // ignore if not valid JSON
    }

    saveToHistory(
      {
        type: 'explainer',
        title: `Explainer: ${topic}`,
        prompt: promptResult,
        inputs: {
          topic,
          keyPoints,
          visualStyle,
          audience,
          cta,
          duration,
        } as ExplainerInputs,
      },
      user?.email,
    );

    return promptResult;
  };

  const handleGenerateKineticTypographyPrompt = async (
    script: string,
    visualStyle: string,
    energy: string,
    background: string,
    colorPalette: string,
    music: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ): Promise<string> => {
    const detailedSystemInstructionBase = `${DETAILED_CINEMATIC_SYSTEM_INSTRUCTION}

You are a master motion graphics designer and AI prompt engineer specializing in creating dynamic, engaging kinetic typography videos. Your task is to take a user's script and stylistic preferences and break it down into a structured JSON array of scenes for a video generation AI.

**CRITICAL KINETIC TYPOGRAPHY INSTRUCTIONS:**
1.  **Script Breakdown:** Analyze the user's full script and divide it into short, logical phrases or sentences. Each phrase will become a single shot/scene object in the JSON array.
2.  **Focus on Text Animation:** The 'description' field for each JSON object is paramount. You MUST meticulously describe the kinetic animation of the text for that phrase. Use active, descriptive language. For example: "The word 'Powerful' slides in quickly from the left, scaling up slightly upon stopping." or "The phrase 'A New Way to Work' types onto the screen with a blinking cursor effect."
3.  **Visual Storytelling:** Even without characters, you are telling a story with text. Use visual hierarchy (size, color, position) and motion to emphasize key words and guide the viewer's eye through the message.
4.  **Empty Character Fields:** The 'characters' array in each JSON object should typically be an empty array \`[]\` unless the user specifically asks for illustrative characters.
5.  **Scene & Shot Details:** Use the 'shot' and 'scene' objects to enhance the typography. 'camera_motion' can add subtle zooms or pans to create energy. 'scene.props' can describe abstract background elements that complement the text.
6.  **Voiceover Sync:** Place the exact text for each scene into the \`audio.voice\` field. This ensures the visual animation can be synced with a voiceover.`;

    const compactSystemInstructionBase = `${HAILUO_COMPACT_SYSTEM_INSTRUCTION}

You are a master motion graphics designer specializing in kinetic typography. Condense the user's script and style choices into a single, compact JSON object.
1.  **Synthesize Script:** Internally, plan the animation for the entire script.
2.  **Flowing Description:** The 'description' field MUST be a single, flowing cinematic paragraph that describes the entire kinetic typography sequence from beginning to end. Detail the animation of key phrases and how they transition.
3.  **Full Script in Voice:** The 'audio.voice' field must contain the *complete*, unaltered user-provided script.`;

    let detailedSystemInstruction = detailedSystemInstructionBase;
    let compactSystemInstruction = compactSystemInstructionBase;

    if (!includeTextOnImage) {
      detailedSystemInstruction += NO_TEXT_INSTRUCTION;
      compactSystemInstruction += NO_TEXT_INSTRUCTION;
    }

    const systemInstruction = promptFormat === 'hailuo-compact' ? compactSystemInstruction : detailedSystemInstruction;

    const promptText = `
      Create a kinetic typography video prompt series with these details:
      - Full Script to Animate: "${script}"
      - Visual Style: ${visualStyle}
      - Pacing/Energy Level: ${energy}
      - Background Description: ${background}
      - Color Palette Description: ${colorPalette}
      - Music/SFX Cues: ${music}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {parts: [{text: promptText}]},
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let promptResult = response.text;
    try {
        const parsed = JSON.parse(promptResult);
        promptResult = JSON.stringify(parsed, null, 2);
    } catch(e) {
        // ignore if not valid JSON
    }

    saveToHistory(
      {
        type: 'kinetic',
        title: `Kinetic: ${script.substring(0, 20)}...`,
        prompt: promptResult,
        inputs: {
          script,
          visualStyle,
          energy,
          background,
          colorPalette,
          music,
        } as KineticTypographyInputs,
      },
      user?.email,
    );

    return promptResult;
  };


  const handleAnimate = async (
    prompt: string,
    imageFile: File | null = null,
    includeTextOnImage = true,
  ) => {
    setSavingTitle('Generating your scene...');
    setIsSaving(true);
    setGenerationError(null);

    try {
      let finalPrompt = prompt;
      try {
        const parsed = JSON.parse(prompt);
        if (Array.isArray(parsed) && parsed.length > 0) {
          finalPrompt = parsed[0].description || JSON.stringify(parsed[0]);
        } else if (typeof parsed === 'object' && parsed !== null) {
          finalPrompt = parsed.description || JSON.stringify(parsed);
        }
      } catch (e) {
        // Not JSON, use as is.
        console.warn(
          'Could not parse prompt as JSON for image generation, using raw prompt.',
        );
      }
      
      console.log('Generating image from prompt...', finalPrompt);
      const imageBase64 = await generateImage(
        finalPrompt,
        '16:9',
        imageFile,
        includeTextOnImage,
      );

      if (!imageBase64) {
        throw new Error('Image generation returned no data.');
      }

      console.log('Generated image data received.');
      const src = `data:image/jpeg;base64,${imageBase64}`;

      setGeneratedResult({imageSrc: src, prompt: finalPrompt});
    } catch (error) {
      console.error('Image generation failed:', error);
      setGenerationError([
        'Image generation failed.',
        'Please check your API key or try a different prompt.',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateImageForCard = async (
    prompt: string,
    includeTextOnImage: boolean,
  ): Promise<string> => {
    return generateImage(prompt, '16:9', null, includeTextOnImage);
  };

  if (isSaving) {
    return (
      <SavingProgressPage
        title={savingTitle}
        subtitle="Please wait while we generate your image."
      />
    );
  }

  if (playingVideo) {
    return <VideoPlayer video={playingVideo} onClose={handleClosePlayer} />;
  }

  if (generatedResult) {
    return (
      <GeneratedImageModal
        imageSrc={generatedResult.imageSrc}
        prompt={generatedResult.prompt}
        onClose={() => setGeneratedResult(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <AnimateImagePage
        onAnimate={handleAnimate}
        onPlayVideo={setPlayingVideo}
        onGenerateStoryboard={handleGenerateStoryboard}
        onGenerateLogoPrompt={handleGenerateLogoPrompt}
        onGenerateYouTubeIntroPrompt={handleGenerateYouTubeIntroPrompt}
        onGenerateExplainerVideoPrompt={handleGenerateExplainerVideoPrompt}
        onGenerateKineticTypographyPrompt={handleGenerateKineticTypographyPrompt}
        onGenerateImageForCard={handleGenerateImageForCard}
        onGenerateSceneDescriptions={handleGenerateSceneDescriptions}
        onGenerateNextScene={handleGenerateNextScene}
      />
      {generationError && (
        <ErrorModal
          message={generationError}
          onClose={() => setGenerationError(null)}
          onSelectKey={async () => await window.aistudio?.openSelectKey()}
        />
      )}
    </div>
  );
};
