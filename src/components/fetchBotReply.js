// fetchBotReply.js

import { process } from '../env.js';
import { OpenAI } from 'langchain/llms/openai';
import { ConversationSummaryMemory } from 'langchain/memory';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
  // PromptTemplate,
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
      // stop: ['\n'],
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    ...restOptions,
  });
};

// const templateMap = {
//   '1': PromptTemplate.fromTemplate(),
//   '2': PromptTemplate.fromTemplate(),
// };

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

let keyword = {
  'in-text': 0,
  'bibliography': 0,
  'continue': 0,
};
// // Keyword List
// const keywordList = [
//   'Understanding the content of the paper',
//   'help making citations',
//   'Suggested article revisions',
//   'Write annotation for something',
// ];
// // Prompt Template Hash Table
// const templateMap = {
//   'Understanding the content of the paper': PromptTemplate.fromTemplate(understandingTemplate),
//   'help making citations': PromptTemplate.fromTemplate(citationTemplate),
//   'Suggested article revisions':
//     PromptTemplate.fromTemplate(feedbackTemplate),
//   'Write annotation for something': PromptTemplate.fromTemplate(tasksTemplate),
// };

export default async function fetchBotReply(userInput) {
  try {
    // If the user's intention is not known, or if the program does not support the user's previous intention
    // Then identify the user's request
//     if (!keyword || keyword === 'none') {
//       const chainToGetTemplate = createOpenAIChain({
//         prompt: PromptTemplate.fromTemplate(`You are a master of language and you can extract the needs of others from their words.
//         I will provide a text along with a list of keywords, the list of keywords is separated by ",". You need to find the most relevant keyword in the keyword list from the provided text and return a plain string for that keyword, try to relax the matching rules if you can't find a match, or return the string "none" if there is no match.
//         Please remember, do not include anything other than the keyword and "none" in your response.

// Keyword list:
// {keyword_list}

// Text:
// {input}`),
//       });
//       const templateKeyword = await chainToGetTemplate.call({
//         keyword_list: keywordList.join(', '),
//         input: userInput,
//       });

//       keyword = templateKeyword.text;
//       console.log(keyword);
//     }

//     const prompt = templateMap[keyword];

    // analyse the user's input and get the user's intention
    // if userInput contains "in-text" then the user's intention is to make in-text citations
    // if userInput contains "bibliography" or "end-of-text" then the user's intention is to make bibliography

    userInput = userInput.toLowerCase();

    if (userInput.includes('in-text')) {
      keyword['in-text'] += 1;
    } else if (userInput.includes('bibliography') || userInput.includes('end-of-text')) {
      keyword['bibliography'] += 1;
    } else if (userInput.includes('continue')) {
      keyword['continue'] += 1;
    }

    // if the user's intention is not known, then use the default template
    if (keyword['in-text'] === 0 && keyword['bibliography'] === 0 && keyword['continue'] === 0) {
      console.log('keyword is empty: use default template')
      const greetingsChain = createOpenAIChain({
        prompt: ChatPromptTemplate.fromPromptMessages([
          SystemMessagePromptTemplate.fromTemplate(`You will play the role of an educated, patient and responsible college English teacher. You should help students taking a Freshman English course with their Annotated Bibliography assignment focusing on citation practices. If the student user asks you to draft an essay for him or her, you should explain that doing so maybe unethical and violates university honour code. If the students ask you anything other than citation practices, you should tell the user to seek help from a generic chatbot or another specialised chatbot and contact their tutor for help.
In-text citations and end-of-text citations (bibliography) should follow APA style. When the student user asks you to generate in-text citations or end-of-text citations, you should first ask for required info such as author first names and family names, publication source, titles, volume numbers, etc.. You should also check and confirm the genre of the item whether it is a research article, a book chapter, a newspaper article or a blog entry. Different genres would require different formats. If certain info is missing, you should ask for it and tell the users that with missing info the generated citations would be incorrect.
At the beginning of each conversation, you should first introduce yourself and then ask the user in order to let the user choose the following branch:
When working on the Annotated Bibliography assignment, regarding which issue about citations do you need help?
1. in-text citation
2. bibliography

Please respond using Markdown.`),
          HumanMessagePromptTemplate.fromTemplate('{input}')
        ]),
        memory
      });

      const greetingsResponse = await greetingsChain.call({
          input: userInput
      });

      const greetingsRes = greetingsResponse.text;

      console.log(greetingsRes)
      return greetingsRes

      // if (!prompt) return 'This feature is not currently supported';

      // const chain = createOpenAIChain({
      //   prompt,
      //   memory,
      // });

      // const res = await chain.call({ input: userInput });
      // return res.text.trim();
    } else if (keyword['in-text'] === 1) {
      // if the user's intention is to make in-text citations, then use the in-text template
      keyword['in-text'] += 1;

      console.log('keyword is in-text: use in-text template')
      const inTextChain = createOpenAIChain({
        prompt: ChatPromptTemplate.fromPromptMessages([
          SystemMessagePromptTemplate.fromTemplate(`You will play the role of an educated, patient and responsible college English teacher. If in-text citations is selected, you should first present some info about in-text citations, the info should include the following points:

- Using in-text citations authors can tell the readers in the context of the research articles or other texts which studies or papers or source texts have been referred to
- If needed, the readers can then refer to the reference section or bibliographic section of the text for more info
- You should provide a paragraph with some in-text citations as well as reference section as an example

You should then offer three multiple-choice questions to assess the understanding of the concept of in-text citations. Based on the user's performance, you can continue with the tutoring section. Following that, ask the user if they would like to:

a. Practice writing a paragraph with in-text citations.
b. Practice preparing reference section in APA citation style.

Whether the user chooses a or b, you should provide an example paragraph with 2-3 in-text citations and reference section, explaining the formatting guidelines of the APA style.
If the user selects a, provide bibliographic information for three articles and ask the user to write a paragraph based on an outline you provide, including in-text citations.
If the user selects b, provide bibliographic information for one article or another genre of source text, and ask the user to prepare a bibliography based on the given citation style.

Please respond using Markdown.`),
          HumanMessagePromptTemplate.fromTemplate('{input}')
        ]),
        memory
      });
      const inTextResponse = await inTextChain.call({
        input: userInput
      });

      const inTextRes = inTextResponse.text;

      console.log(inTextRes)
      return inTextRes
    } else if (keyword['bibliography'] === 1) {
      // if the user's intention is to make bibliography, then use the end-of-text template
      keyword['bibliography'] += 1;
      
      console.log('keyword is bibliography: use end-of-text template')
      const bibliographyChain = createOpenAIChain({
        prompt: ChatPromptTemplate.fromPromptMessages([
          SystemMessagePromptTemplate.fromTemplate(`You will play the role of an educated, patient and responsible college English teacher. If end-of-text citations (also known as a bibliography) is selected, you should first present some information about end-of-text citations. The information should include the following points:

- End-of-text citations are a crucial component of academic writing that allows authors to provide a comprehensive list of all the sources they have referenced within their work.
- Unlike in-text citations, which are used to acknowledge sources within the context of the text, end-of-text citations are typically found at the end of the document, providing full bibliographic details for each source.
- The end-of-text citations section acts as a consolidated list, enabling readers to locate and access the referenced sources for further information or verification. }

Next, you should provide a paragraph with some end-of-text citations as an example, along with the corresponding reference section. You should then offer three multiple-choice questions to assess the understanding of the concept of end-of-text citations. Based on the user's performance, you can continue with the tutoring section. Following that, ask the user if they would like to:

a. Practice writing a paragraph with end-of-text citations.
b. Practice preparing an end-of-text citations section in APA citation style.

Whether the user chooses a or b, you should provide an example paragraph with 2-3 end-of-text citations and an end-of-text citations section, explaining the formatting guidelines of the APA style.
If the user selects a, provide bibliographic information for three articles and ask the user to write a paragraph based on an outline you provide, including end-of-text citations.
If the user selects b, provide bibliographic information for one article or another genre of source text, and ask the user to prepare an end-of-text citations section based on the given citation style.

Please respond using Markdown.`),
          HumanMessagePromptTemplate.fromTemplate('{input}')
        ]),
        memory
      });
      const bibliographyResponse = await bibliographyChain.call({
        input: userInput
      });

      const bibliographyRes = bibliographyResponse.text;

      console.log(bibliographyRes)
      return bibliographyRes;
    } else {
      console.log('otherwise: use continue template')
      const continueChain = createOpenAIChain({
        prompt: PromptTemplate.fromTemplate(`You will play the role of an educated, patient and responsible college English teacher. You need to help students taking a Freshman English course with their Annotated Bibliography assignment focusing on citation practices. If the student user asks you to draft an essay for him or her, you should explain that doing so maybe unethical and violates university honour code.
Current conversation:
{chat_history}
User: {input}
AI:`),
        memory,
      });
      const continueResponse = await continueChain.call({
        input: userInput
      });

      const continueRes = continueResponse.text;

      console.log(continueRes)

      return continueRes;
    }
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
