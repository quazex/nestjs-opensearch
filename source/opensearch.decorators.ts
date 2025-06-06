import { Inject } from '@nestjs/common';
import { OpenSearchTokens } from './opensearch.tokens';

export const InjectOpenSearch = (): ReturnType<typeof Inject> => {
    const token = OpenSearchTokens.getClient();
    return Inject(token);
};
