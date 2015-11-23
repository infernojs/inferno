import Inferno from '../../src';

export default function cssOperationTests(describe, expect) {
    describe('CSS operations', () => {
		let container;

		beforeEach(() => {
			container = document.createElement('div');
		});

		afterEach(() => {
			Inferno.clearDomElement(container);
		});

		describe('should handle basic styles', () => {
		   let template;
		   const styleRule = { width:200, height:200 };

		   beforeEach(() => {
			   template = Inferno.createTemplate(createElement =>
				   createElement('div', { style: styleRule })
			   );
			   Inferno.render(Inferno.createFragment(null, template), container);
		   });

		   it('Initial render (creation)', () => {
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div style="width: 200px; height: 200px;"></div>'
			   );
		   });
		});

		describe('should update styles when "style" changes from null to object', () => {
		   let template;
		   const styles = {color: 'red'};

		   beforeEach(() => {
			   template = Inferno.createTemplate(createElement =>
				   createElement('div', { style: {null} })
			   );
			   Inferno.render(Inferno.createFragment(null, template), container);
		   });

		   it('Initial render (creation)', () => {
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div></div>'
			   );
		   });
		   it('Second render (update)', () => {
			   template = Inferno.createTemplate(createElement =>
				   createElement('div', { style: styles })
			   );
			   Inferno.render(Inferno.createFragment(null, template), container);
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div style="color: red;"></div>'
			   );
		   });
		});

		describe('should update styles when "style" for a dynamic variable', () => {
		   let template;

		   beforeEach(() => {
			   template = Inferno.createTemplate((createElement, createComponent, styles) =>
				   createElement('div', { style: styles })
			   );
			   Inferno.render(Inferno.createFragment({color: "red", border: '1px'}, template), container);
		   });

		   it('Initial render (creation)', () => {
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div style="color: red; border: 1px;"></div>'
			   );
		   });
		   it('Second render (update)', () => {
			   template = Inferno.createTemplate((createElement, createComponent, styles) =>
				   createElement('div', { style: styles })
			   );
			   Inferno.render(Inferno.createFragment({color: "blue"}, template), container);
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div style="color: blue;"></div>'
			   );
		   });
		});

		describe('should ignore null styles', () => {
		   let template;
		   const styleRule = { backgroundColor: null, display: 'none' };

		   beforeEach(() => {
			   template = Inferno.createTemplate(createElement =>
				   createElement('div', { style: styleRule })
			   );
			   Inferno.render(Inferno.createFragment(null, template), container);
		   });

		   it('Initial render (creation)', () => {
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div style="display: none;"></div>'
			   );
		   });
		});

		describe('should not set NaN value on styles', () => {
		   let template;
		   const styleRule = { 'font-size': parseFloat('zoo') } ;

		   beforeEach(() => {
			   template = Inferno.createTemplate(createElement =>
				   createElement('div', { style: styleRule })
			   );
			   Inferno.render(Inferno.createFragment(null, template), container);
		   });

		   it('Initial render (creation)', () => {
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div></div>'
			   );
		   });
		});

		describe('should trim values so `px` will be appended correctly', () => {
		   let template;
		   const styleRule = { margin: '16 ' };

		   beforeEach(() => {
			   template = Inferno.createTemplate(createElement =>
				   createElement('div', { style: styleRule })
			   );
			   Inferno.render(Inferno.createFragment(null, template), container);
		   });

		   it('Initial render (creation)', () => {
			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div style="margin: 16px;"></div>'
			   );
		   });
		});

		describe('should support number values', () => {
		   let template;
		   const styleRule = { width: 7 };

		   beforeEach(() => {
			   template = Inferno.createTemplate(createElement =>
				   createElement('div', { style: styleRule })
			   );
			   Inferno.render(Inferno.createFragment(null, template), container);
		   });

		   it('Initial render (creation)', () => {

			   expect(
				   container.innerHTML
			   ).to.equal(
				   '<div style="width: 7px;"></div>'
			   );
		   });
		});
	});
}
