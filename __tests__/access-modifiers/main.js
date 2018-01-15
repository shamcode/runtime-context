import { _private, _protected, injectContext, runInContext } from '../../src/index';

describe( 'Stack trace with one element, without inheritance', () => {
    @injectContext
    class Base {
        constructor( callback ) {
            this.callback = callback;
        }

        @_private privateBase( foo ) {
            this.callback( foo );
        }

        @_protected protectedBase( foo ) {
            this.callback( foo );
        }

        publicBase( foo ) {
            this.callback( foo );
        }
    }

    it( 'privateBase()', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        try {
            base.privateBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.privateBase is private!' );
        }
        expect( callback.mock.calls.length ).toBe( 0 );
    } );

    it( 'protectedBase()', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        try {
            base.protectedBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.protectedBase is protected!' );
        }
        expect( callback.mock.calls.length ).toBe( 0 );
    } );

    it( 'publicBase()', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        base.publicBase( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
    } );
} );

describe( 'Stack trace with two element, without inheritance', () => {
    @injectContext
    class Base {
        constructor( callback ) {
            this.callback = callback;
        }

        @_private privateBase( foo ) {
            this.callback( foo );
        }

        @_protected protectedBase( foo ) {
            this.callback( foo );
        }

        publicBaseForPrivate( foo ) {
            this.privateBase( foo );
        }

        publicBaseForProtected( foo ) {
            this.protectedBase( foo );
        }

        publicBase( foo ) {
            this.callback( foo );
        }
    }

    it( 'publicBaseForPrivate() -> privateBase()', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        base.publicBaseForPrivate( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
    } );

    it( 'publicBaseForProtected() -> protectedBase()', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        base.publicBaseForProtected( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
    } );

    it( 'publicBase(); privateBase();', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        base.publicBase( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
        try {
            base.privateBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.privateBase is private!' );
        }
        expect( callback.mock.calls.length ).toBe( 1 );
    } );

    it( 'publicBase(); protectedBase();', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        base.publicBase( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
        try {
            base.protectedBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.protectedBase is protected!' );
        }
        expect( callback.mock.calls.length ).toBe( 1 );
    } );

    it( 'publicBaseForPrivate(); privateBase();', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        base.publicBaseForPrivate( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
        try {
            base.privateBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.privateBase is private!' );
        }
        expect( callback.mock.calls.length ).toBe( 1 );
    } );

    it( 'publicBaseForProtected(); protectedBase();', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        base.publicBaseForProtected( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
        try {
            base.protectedBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.protectedBase is protected!' );
        }
        expect( callback.mock.calls.length ).toBe( 1 );
    } );
} );

describe( 'Stack trace with two element, with inheritance', () => {
    @injectContext
    class Base {
        constructor( callback ) {
            this.callback = callback;
        }

        @_private privateBase( foo ) {
            this.callback( foo );
        }

        @_protected protectedBase( foo ) {
            this.callback( foo );
        }

        publicBaseForPrivate( foo ) {
            this.privateBase( foo );
        }

        publicBaseForProtected( foo ) {
            this.protectedBase( foo );
        }

        publicBase( foo ) {
            this.callback( foo );
        }
    }

    class Child extends Base {
        publicChildForPrivate( foo ) {
            this.privateBase( foo );
        }

        publicChildForProtected( foo ) {
            this.protectedBase( foo );
        }
    }

    it( 'child.privateBase()', () => {
        const callback = jest.fn();
        const child = new Child( callback );
        try {
            child.privateBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.privateBase is private!' );
        }
        expect( callback.mock.calls.length ).toBe( 0 );
    } );

    it( 'child.protectedBase()', () => {
        const callback = jest.fn();
        const child = new Child( callback );
        try {
            child.protectedBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.protectedBase is protected!' );
        }
        expect( callback.mock.calls.length ).toBe( 0 );
    } );

    it( 'child.publicBaseForPrivate()', () => {
        const callback = jest.fn();
        const child = new Child( callback );
        child.publicBaseForPrivate( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
    } );

    it( 'child.publicBaseForProtected()', () => {
        const callback = jest.fn();
        const child = new Child( callback );
        child.publicBaseForProtected( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
    } );

    it( 'child.publicBase()', () => {
        const callback = jest.fn();
        const child = new Child( callback );
        child.publicBase( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
    } );

    it( 'child.publicChildForPrivate()', () => {
        const callback = jest.fn();
        const child = new Child( callback );
        try {
            child.publicChildForPrivate( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.privateBase is private!' );
        }
        expect( callback.mock.calls.length ).toBe( 0 );
    } );

    it( 'child.publicChildForProtected()', () => {
        const callback = jest.fn();
        const child = new Child( callback );
        child.publicChildForProtected( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ] ).toEqual( [ 42 ] );
    } );
} );

describe( 'Three classes', () => {
    @injectContext
    class Base {
        constructor( callback ) {
            this.callback = callback;
        }

        @_private privateBase( foo ) {
            this.callback( foo );
        }

        @_protected protectedBase( foo ) {
            this.privateBase( foo );
        }
    }

    class Child extends Base {}

    class ChildChild extends Child {
        publicChildChild( foo ) {
            this.protectedBase( foo );
        }
    }

    it( 'publicChildChild() -> protectedBase() -> privateBase()', () => {
        const callback = jest.fn();
        const child = new ChildChild( callback );
        child.publicChildChild( 42 );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ][ 0 ] ).toBe( 42 );
    } );
} );

describe( 'Add custom context for private', () => {
    @injectContext
    class Base {
        constructor( callback ) {
            this.callback = callback;
        }

        @_private privatFirstBase( foo ) {
            this.callback( foo );
        }

        @_private privateSecondBase( foo ) {
            this.callback( foo );
        }
    }

    it( 'privatFirstBase()', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        const basePrototype = Object.getPrototypeOf( base );
        runInContext( Object.getPrototypeOf( basePrototype ).constructor, () => {
            base.privatFirstBase( 42 );
            base.privateSecondBase( 84 );
        } );
        expect( callback.mock.calls.length ).toBe( 2 );
        expect( callback.mock.calls[ 0 ][ 0 ] ).toBe( 42 );
        expect( callback.mock.calls[ 1 ][ 0 ] ).toBe( 84 );
    } );
} );

describe( 'Add custom context for protected', () => {
    @injectContext
    class Base {
        constructor( callback ) {
            this.callback = callback;
        }

        @_protected protectedBase( foo ) {
            this.callback( foo );
        }
    }

    it( 'protectedBase()', () => {
        const callback = jest.fn();
        const base = new Base( callback );
        runInContext( base, () => {
            base.protectedBase( 42 );
        } );
        expect( callback.mock.calls.length ).toBe( 1 );
        expect( callback.mock.calls[ 0 ][ 0 ] ).toBe( 42 );
    } );
} );
