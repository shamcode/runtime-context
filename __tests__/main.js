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

it( 'foo.process()', () => {
    runInContext( Context, () => {
        const processMock = jest.fn();
        const foo = new Foo( processMock );
        try {
            foo.process();
        } catch ( e ) {
            expect( e.message ).toBe( 'Foo.process is protected!' );
        }
        expect( processMock.mock.calls.length ).toBe( 0 );
    } );
} );

it( 'foo.publicForProcess()', () => {
    runInContext( Context, () => {
        const processMock = jest.fn();
        const foo = new Foo( processMock );
        foo.publicForProcess();
        expect( processMock.mock.calls.length ).toBe( 1 );
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


it( 'foo.publicMethodForPrint()', () => {
    runInContext( Context, () => {
        const printMock = jest.fn();
        const foo = new Foo( null, printMock );
        foo.publicMethodForPrint();
        expect( printMock.mock.calls.length ).toBe( 1 );
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