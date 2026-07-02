export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  chat(messages: IMessage[]): Promise<string>;
  analyze(prompt: string, jsonFormat?: boolean): Promise<string>;
  getName(): string;
}
export default AIProvider;
