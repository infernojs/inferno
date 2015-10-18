import quoteAttributeValueForBrowser from '../../../src/ssr/quoteAttributeValueForBrowser';
import escapeTextContentForBrowser from '../../../src/ssr/escapeTextContentForBrowser';

export default function escapeTests(describe, expect, Inferno) {
	
    describe('quoteAttributeValueForBrowser', () => {

        it('should escape boolean to string', () => {
            expect(quoteAttributeValueForBrowser(true)).to.eql('"true"');
            expect(quoteAttributeValueForBrowser(false)).to.eql('"false"');
        });

        it('should escape object to string', () => {
            var escaped = quoteAttributeValueForBrowser({
                toString () {
                    return 'british people are crazy!';
                }
            });

            expect(escaped).to.eql('"british people are crazy!"');
        });

        it('should escape number to string', () => {
            expect(quoteAttributeValueForBrowser(42)).to.eql('"42"');
        });

        it('should escape string', () => {
            var escaped = quoteAttributeValueForBrowser('&');
            expect(escaped).to.eql('"&amp;"');
        });

    });


    describe('escapeTextContentForBrowser', () => {

        it('should escape boolean to string', () => {
            expect(escapeTextContentForBrowser(true)).to.eql('true');
            expect(escapeTextContentForBrowser(false)).to.eql('false');
        });

        it('should escape object to string', () => {
            var escaped = escapeTextContentForBrowser({
                toString () {
                    return 'british people are crazy!';
                }
            });

            expect(escaped).to.eql('british people are crazy!');
        });

        it('should escape number to string', () => {
            expect(escapeTextContentForBrowser(42)).to.eql('42');
        });

        it('should escape string', () => {
            expect(escapeTextContentForBrowser('&')).to.eql('&amp;');
        });

    });
}