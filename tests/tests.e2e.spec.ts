import { setTimeout } from 'timers/promises';
import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { TestingOpenSearchFactory } from './tests.factory';
import { TestingData } from './tests.types';

describe('Opensearch > E2E', () => {
    const tModule = new TestingOpenSearchFactory();

    beforeAll(tModule.init.bind(tModule));
    afterAll(tModule.close.bind(tModule));

    test('Check connection', async() => {
        const service = tModule.getService();
        const isHealth = await service.ping();

        expect(isHealth).toBe(true);
    });

    test('Check write/read operations', async() => {
        const service = tModule.getService();

        const listCount = faker.number.int({ min: 2, max: 4 });
        const total = faker.number.int({ min: 10, max: 20 });

        const data = Array(total).fill({}).map<TestingData>((_d, index) => ({
            id: faker.string.uuid(),
            name: faker.person.firstName(),
            orders: faker.number.int({ min: 0, max: 100 }),
            list: Array(listCount).fill(0).map(() => (index + 1)),
            is_new: Number(faker.datatype.boolean()),
            updated_at: faker.date.past().getTime(),
        }));
        const random = faker.helpers.arrayElement(data);

        await service.write(data);

        for (let index = 0; index < 10; index += 1) {
            const reply = await service.read(random.id);
            if (!reply) {
                await setTimeout(1_000);
                continue;
            }
            expect(reply).toMatchObject(random);
        }
    });
});
