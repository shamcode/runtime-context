import { _private, _protected, injectContext, runInContext } from '../src/index';

// Test contexts
class Context {

}

@injectContext
class Foo {
    constructor( processCallback, printCallback ) {
        this.processCallback = processCallback;
        this.printCallback = printCallback;
    }

    @_protected process() {
        this.processCallback();
    }

    @_private print() {
        this.printCallback();
    }

    publicForProcess() {
        this.process();
    }

    publicMethodForPrint() {
        this.print();
    }
}


class Bar extends Foo {
    processFile() {

        // Correct
        this.process();
    }

    publicMethod2() {
        this.print();
    }
}

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

    }

    it( 'child.privateBase()', () => {
        const callback = jest.fn();
        const base = new Child( callback );
        try {
            base.privateBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.privateBase is private!' );
        }
        expect( callback.mock.calls.length ).toBe( 0 );
    } );

    it( 'child.protectedBase()', () => {
        const callback = jest.fn();
        const base = new Child( callback );
        try {
            base.protectedBase( 42 );
        } catch ( e ) {
            expect( e.message ).toBe( 'Base.protectedBase is protected!' );
        }
        expect( callback.mock.calls.length ).toBe( 0 );
    } );
} );

it( 'bar.process()', () => {
    runInContext( Context, () => {
        const processMock = jest.fn();
        const bar = new Bar( processMock );
        try {
            bar.process();
        } catch ( e ) {
            expect( e.message ).toBe( 'Foo.process is protected!' );
        }
        expect( processMock.mock.calls.length ).toBe( 0 );
    } );
} );

it( 'bar.processFile()', () => {
    runInContext( Context, () => {
        const processMock = jest.fn();
        const bar = new Bar( processMock );
        bar.processFile();
        expect( processMock.mock.calls.length ).toBe( 1 );
    } );
} );

it( 'bar.publicForProcess()', () => {
    runInContext( Context, () => {
        const processMock = jest.fn();
        const bar = new Bar( processMock );
        bar.publicForProcess();
        expect( processMock.mock.calls.length ).toBe( 1 );
    } );
} );

it ( 'bar.print()', () => {
    runInContext( Context, () => {
        const printMock = jest.fn();
        const bar = new Bar( null, printMock );
        try {
            bar.print();
        } catch ( e ) {
            expect( e.message ).toBe( 'Foo.print is private!' );
        }
        expect( printMock.mock.calls.length ).toBe( 0 );
    } );
} );

it( 'bar.publicMethodForPrint()', () => {
    runInContext( Context, () => {
        const printMock = jest.fn();
        const bar = new Bar( null, printMock );
        bar.publicMethodForPrint();
        expect( printMock.mock.calls.length ).toBe( 1 );
    } );
} );

it ( 'bar.publicMethod2()', () => {
    runInContext( Context, () => {
        const printMock = jest.fn();
        const bar = new Bar( null, printMock );
        try {
            bar.publicMethod2();
        } catch ( e ) {
            expect( e.message ).toBe( 'Foo.print is private!' );
        }
        expect( printMock.mock.calls.length ).toBe( 0 );
    } );
} );

it( 'publicChild() -> privateBase() must throw error', () => {
    @injectContext
    class Base {
        constructor( callback ) {
            this.callback = callback;
        }

        @_private privateBase( foo ) {
            this.callback( foo );
        }
    }

    class Child extends Base {
        publicChild( foo ) {
            this.privateBase( foo );
        }
    }

    const callback = jest.fn();
    const child = new Child( callback );
    try {
        child.publicChild( 42 );
    } catch ( e ) {
        expect( e.message ).toBe( 'Base.privateBase is private!' );
    }
    expect( callback.mock.calls.length ).toBe( 0 );
} );

it( 'publicChildChild() -> protectedBase() -> privateBase()', () => {
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

    const callback = jest.fn();
    const child = new ChildChild( callback );
    child.publicChildChild( 42 );
    expect( callback.mock.calls.length ).toBe( 1 );
    expect( callback.mock.calls[ 0 ][ 0 ] ).toBe( 42 );
} );