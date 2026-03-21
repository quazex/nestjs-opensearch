import { Inject } from '@nestjs/common'
import { OpenSearchTokens } from './opensearch.tokens'

export const InjectOpenSearch = (): ReturnType<typeof Inject> => (
  Inject(OpenSearchTokens.CLIENT)
)
