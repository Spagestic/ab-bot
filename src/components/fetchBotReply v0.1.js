// fetchBotReply.js

import { process } from '../env.js';
import { OpenAI } from 'langchain/llms/openai';
import { ConversationSummaryMemory } from 'langchain/memory';
import {
  PromptTemplate,
  // SystemMessagePromptTemplate,
  // ChatPromptTemplate,
  // HumanMessagePromptTemplate
} from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
// import { MultiPromptChain } from "langchain/chains";
// import { initializeAgentExecutorWithOptions } from "langchain/agents";
// import { BingSerpAPI } from "langchain/tools";

const memory = new ConversationSummaryMemory({
  memoryKey: 'chat_history',
  llm: new OpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  }),
});

const createOpenAIChain = (restOptions) => {
  return new LLMChain({
    llm: new OpenAI({
      modelName: 'gpt-3.5-turbo',
      // streaming: true,
      temperature: 0.9,
      // verbose: true,
      // maxTokens: 90,
      stop: ['\n'],
      // verbose: true,
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    ...restOptions,
  });
};

const understandingTemplate = `
  You are an AI that helps university freshmen with understanding academic content.
  Current conversation:
  {chat_history}
  User: {input}
  AI:`;

const citationTemplate = `
  You are an AI that assists university freshmen with making citations in their academic writing.
  Current conversation:
  {chat_history}
  User: {input}
  AI:`;

const feedbackTemplate = `
  You are an AI that provides feedback on academic writing for university freshmen.
  Current conversation:
  {chat_history}
  User: {input}
  AI:`;

const tasksTemplate = `
  You are an AI that assigns small tasks to university freshmen to help them with their academic writing.
  Current conversation:
  {chat_history}
  User: {input}
  AI:`;

let keyword;
// Keyword List
const keywordList = [
  'Understanding the content of the paper',
  'help making citations',
  'Suggested article revisions',
  'Write annotation for something',
];
// Prompt Template Hash Table
const templateMap = {
  'Understanding the content of the paper': PromptTemplate.fromTemplate(understandingTemplate),
  'help making citations': PromptTemplate.fromTemplate(citationTemplate),
  'Suggested article revisions':
    PromptTemplate.fromTemplate(feedbackTemplate),
  'Write annotation for something': PromptTemplate.fromTemplate(tasksTemplate),
};

export default async function fetchBotReply(userInput) {
  try {
    // If the user's intention is not known, or if the program does not support the user's previous intention
    // Then identify the user's request
    if (!keyword || keyword === 'none') {
      const chainToGetTemplate = createOpenAIChain({
        prompt: PromptTemplate.fromTemplate(`You are a master of language and you can extract the needs of others from their words.
        I will provide a text along with a list of keywords, the list of keywords is separated by ",". You need to find the most relevant keyword in the keyword list from the provided text and return a plain string for that keyword, try to relax the matching rules if you can't find a match, or return the string "none" if there is no match.
        Please remember, do not include anything other than the keyword and "none" in your response.

Keyword list:
{keyword_list}

Text:
{input}`),
      });
      const templateKeyword = await chainToGetTemplate.call({
        keyword_list: keywordList.join(', '),
        input: userInput,
      });

      keyword = templateKeyword.text;
      console.log(keyword);
    }

    const prompt = templateMap[keyword];

    if (!prompt) return 'This feature is not currently supported';

    const chain = createOpenAIChain({
      prompt,
      memory,
    });

    const res = await chain.call({ input: userInput });
    return res.text.trim();
  } catch (error) {
    console.error('Error fetching bot reply:', error.message);
    throw error;
  }
}

// export default async function fetchBotReply(userInput) {
//   try {
//     const tools = [
//       new BingSerpAPI(process.env.SERPAPI_API_KEY, {
//         location: "HK",
//         count: 2
//       })
//     ];

//     const model = new OpenAI({
//       modelName: "text-davinci-003",
//       // streaming: true,
//       temperature: 0.9,
//       // verbose: true,
//       maxTokens: 60,
//       // stop: ["\n"],
//       openAIApiKey: process.env.OPENAI_API_KEY
//     });

//     const executor = await initializeAgentExecutorWithOptions(tools, model, {
//       agentType: "chat-conversational-react-description"
//       // memory
//       // verbose: true,
//     });

//     const res = await executor.call({ input: userInput });

//     return res.text.trim();
//   } catch (error) {
//     console.error("Error fetching bot reply:", error.message);
//     throw error;
//   }
// }

// export default async function fetchBotReply(userInput) {
//   try {
//     // Create a SystemMessagePromptTemplate instance
//     const systemMessage = SystemMessagePromptTemplate.fromTemplate(
//       "You are an AI that helps users with annotated bibliography tasks."
//     );
//     const humanMessage = HumanMessagePromptTemplate.fromTemplate("{input}");

//     // Create a new ChatPromptTemplate using the system and human messages
//     const chatPrompt = ChatPromptTemplate.fromPromptMessages([
//       systemMessage,
//       humanMessage
//     ]);

//     const chain = new LLMChain({
//       llm: new OpenAI({
//         modelName: "text-davinci-003",
//         temperature: 0.9,
//         maxTokens: 60,
//         stop: ["\n"],
//         openAIApiKey: process.env.OPENAI_API_KEY
//       }),
//       prompt: chatPrompt, // Update the prompt variable
//       memory
//     });

//     const res = await chain.call({ input: userInput });

//     return res.text.trim();
//   } catch (error) {
//     console.error("Error fetching bot reply:", error.message);
//     throw error;
//   }
// }

// const promptNames = ["understanding", "citation", "feedback", "tasks"];
// const promptDescriptions = [
//   "Help with understanding academic writing and annotated bibliography",
//   "Assist with making in-text citations",
//   "Provide feedback on writing",
//   "Assign small tasks to students"
// ];

// const promptTemplates = [
//   understandingTemplate,
//   citationTemplate,
//   feedbackTemplate,
//   tasksTemplate
// ];

// export default async function fetchBotReply(userInput) {
//   try {
//     const multiPromptChain = MultiPromptChain.fromLLMAndPrompts(memory.llm, {
//       promptNames,
//       promptDescriptions,
//       promptTemplates,
//       memory
//     });

//     const res = await multiPromptChain.call({ input: userInput });

//     return res.text.trim();
//   } catch (error) {
//     console.error("Error fetching bot reply:", error.message);
//     throw error;
//   }
// }

// const promptNames = ["understanding", "citation", "feedback", "tasks"];
// const promptDescriptions = [
//   "Help with understanding academic writing and annotated bibliography",
//   "Assist with making in-text citations",
//   "Provide feedback on writing",
//   "Assign small tasks to students"
// ];

// const understandingTemplate = `
//   You are an AI that helps university freshmen with understanding academic content.
//   Current conversation:
//   {chat_history}
//   User: {input}
//   AI:`;

// const citationTemplate = `
//   You are an AI that assists university freshmen with making citations in their academic writing.
//   Current conversation:
//   {chat_history}
//   User: {input}
//   AI:`;

// const feedbackTemplate = `
//   You are an AI that provides feedback on academic writing for university freshmen.
//   Current conversation:
//   {chat_history}
//   User: {input}
//   AI:`;

// const tasksTemplate = `
//   You are an AI that assigns small tasks to university freshmen to help them with their academic writing.
//   Current conversation:
//   {chat_history}
//   User: {input}
//   AI:`;

// const promptNames = ["understanding", "citation", "feedback", "tasks"];
// const promptDescriptions = [
//   "Help with understanding academic writing and annotated bibliography",
//   "Assist with making in-text citations",
//   "Provide feedback on writing",
//   "Assign small tasks to students"
// ];

// const basePromptTemplate = `
//   You are a Generative AI chatbot that can mentor freshmen in a University English course at HKBU.
//   You help students with academic writing skills, particularly for annotated bibliography.
//   You aims to increase AI literacy and promote academic integrity among university freshmen.
//   You will not write assignments for students but will assist them with specific steps of the task.
//   You will also detect and flag potential plagiarism for students to revise.
//   Current conversation:
//   {chat_history}`;

// const understandingTemplate = `${basePromptTemplate}
//   Task: Help with understanding academic content
//   User: {input}
//   AI:`;

// const citationTemplate = `${basePromptTemplate}
//   Task: Assist with making citations in academic writing
//   User: {input}
//   AI:`;

// const feedbackTemplate = `${basePromptTemplate}
//   Task: Provide feedback on academic writing
//   User: {input}
//   AI:`;

// const tasksTemplate = `${basePromptTemplate}
//   Task: Assign small tasks to help with academic writing
//   User: {input}
//   AI:`;

// const promptTemplates = [
//   understandingTemplate,
//   citationTemplate,
//   feedbackTemplate,
//   tasksTemplate
// ];

// export default async function fetchBotReply(userInput) {
//   try {
//     const multiPromptChain = MultiPromptChain.fromLLMAndPrompts(memory.llm, {
//       promptNames,
//       promptDescriptions,
//       promptTemplates,
//       memory
//     });

//     const res = await multiPromptChain.call({ input: userInput });

//     return res.text.trim();
//   } catch (error) {
//     console.error("Error fetching bot reply:", error.message);
//     throw error;
//   }
// }
