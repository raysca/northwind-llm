import { Runner, InMemoryMemoryService, InMemoryArtifactService, InMemorySessionService } from "@google/adk";
import { rootAgent } from "./agents/northwind";



const runner = new Runner({
    agent: rootAgent,
    memoryService: new InMemoryMemoryService(),
    artifactService: new InMemoryArtifactService(),
    sessionService: new InMemorySessionService(),
    appName: 'test',
});

const session = await runner.sessionService.createSession({
    userId: '1',
    appName: 'test',
});

const runOptions = {
    userId: session.userId,
    sessionId: session.id,
    newMessage: { role: 'user', parts: [{ text: 'What is the current time in London?' }] },
};

for await (const event of runner.runAsync(runOptions)) {
    console.log(event);
}
