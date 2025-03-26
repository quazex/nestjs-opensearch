import { AbstractStartedContainer, GenericContainer, Wait } from 'testcontainers';

export class OpenSearchContainerOptions {
    public readonly port = 9200;
}

export class OpenSearchContainerGeneric extends GenericContainer {
    private readonly options = new OpenSearchContainerOptions();

    constructor(image = 'opensearchproject/opensearch:2.16.0') {
        super(image);
        this
            .withExposedPorts({
                host: this.options.port,
                container: this.options.port,
            })
            .withEnvironment({
                'discovery.type': 'single-node',
                'bootstrap.memory_lock': 'true',
                'OPENSEARCH_JAVA_OPTS': '-Xms512m -Xmx512m',
                'DISABLE_SECURITY_PLUGIN': 'true',
            })
            .withWaitStrategy(Wait.forLogMessage(/shards started/))
            .withStartupTimeout(60_000)
            .withReuse();
    }

    public override async start(): Promise<OpenSearchContainerStarted> {
        const container = await super.start();
        return new OpenSearchContainerStarted(container);
    }
}

export class OpenSearchContainerStarted extends AbstractStartedContainer {
    public getNodeUrl(): string {
        const host = this.getHost();
        const port = this.getFirstMappedPort();
        return `http://${host}:${port}`;
    }
}
