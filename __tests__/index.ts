import {RuleTester} from '@typescript-eslint/rule-tester';
import rule from '../src';

const ruleTester = new RuleTester();

ruleTester.run('sort-imports', rule, {
    valid: [
        {
            code: `
// Vendor
import lodash from 'lodash';
import React from 'react';
import { View } from 'react-native';

// Internal
import MyComponent from './MyComponent';`,
            options: [{ includeComments: true }]
        }, {
            code: `
import lodash from 'lodash';
import React from 'react';
import { View } from 'react-native';

import MyComponent from './MyComponent';`,
            options: [{ includeComments: false }]
        }
    ],
    invalid: [
        {
            code: `
import lodash from 'lodash';
import MyComponent from './MyComponent';
            `,
            options: [{ includeComments: true }],
            errors: [{ messageId: 'unorderedImports' }],
            output: `
// Vendor
import lodash from 'lodash';

// Internal
import MyComponent from './MyComponent';
            `,
        }, {
            code: `
import MyComponent from './MyComponent';
import lodash from 'lodash';
            `,
            options: [{ includeComments: false }],
            errors: [{ messageId: 'unorderedImports' }],
            output: `
import lodash from 'lodash';

import MyComponent from './MyComponent';
            `,
        },
    ],
});
