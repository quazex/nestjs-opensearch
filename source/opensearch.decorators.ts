import { Inject } from '@nestjs/common';
import { OpenSearchUtilities } from './opensearch.utilities';

export const InjectOpenSearch = (name?: string): ReturnType<typeof Inject> => {
    const token = OpenSearchUtilities.getClientToken(name);
    return Inject(token);
};
