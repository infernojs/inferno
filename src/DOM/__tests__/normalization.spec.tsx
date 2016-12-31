import { expect } from 'chai';
import Inferno from 'inferno';
import {isVNode} from "../../core/VNodes";
import {isNullOrUndef} from "../../shared";
Inferno; // suppress ts 'never used' error

describe('Normalization process', () => {
    let container;

    beforeEach(function() {
        container = document.createElement('div');
    });

    afterEach(function() {
        container.innerHTML = '';
    });

    describe('Keys should always be unique within siblings', () => {
        // This function verifies there are no duplicate keys within children vNodes
        // If Inferno goes back to nonKeyed routine in future change this function so that "all" can be null or unique
        function verifyKeys(vNodes) {
            if (Array.isArray(vNodes)) {
                const keyValues = vNodes.map(function(vnode){ return vnode.key });
                const isDuplicate = keyValues.some(function(item, idx){
                    return keyValues.indexOf(item) != idx;
                });

                expect(isDuplicate).to.eql(false, 'All siblings should have unique key');

                for (let i = 0; i < vNodes.length; i++) {
                    verifyKeys(vNodes[i].children)
                }
            } else if (!isNullOrUndef(vNodes) && isVNode(vNodes)) {
                verifyKeys(vNodes.children);
            }
        }

        it('Should work when using functions within siblings', () => {
            function meta(metas) {
                return metas.map(
                    (meta) => {
                        return <meta property={ meta.property } content={ meta.content }/>
                    }
                )
            }

            function link(links) {
                return links.map(
                    (link) => {
                        return <link rel={ link.rel } href={ link.href }/>
                    }
                )
            }

            let vNode = <head>
                <title>{ 'test' }</title>
                { meta([{property: 'p', content: 'c'}, {property: 'p1', content: 'c1'}]) }
                { link([{rel: 'rel', href: 'href1'}, {rel: 'rel', href: 'href2'}]) }
            </head>;

            verifyKeys(vNode);
        });

        /*

         TODO: Add more tests for different structures and create benchmark + optimize normalization process!

         */
    });
});
