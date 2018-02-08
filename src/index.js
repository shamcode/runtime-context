// Core
const RUNTIME_CONTEXTS = [];

const __METADATA__STORE__ = new WeakMap();
const METADATA = {
    get( key ) {
        if ( !METADATA.has( key ) ) {
            METADATA.set( key, {
                protected: [],
                private: []
            } );
        }
        return __METADATA__STORE__.get( key );
    },

    set( key, value ) {
        return __METADATA__STORE__.set( key, value );
    },

    has( key ) {
        return __METADATA__STORE__.has( key );
    }
};

export const runtime = {
    hasInstanceOf( context ) {
        return undefined !== RUNTIME_CONTEXTS.find( i => i instanceof context );
    },
    has( context ) {
        return undefined !== RUNTIME_CONTEXTS.find( i => {
                return Object.is( i, context )
            } );
    },
    push() {
        RUNTIME_CONTEXTS.push.apply( RUNTIME_CONTEXTS, arguments );
    },
    pop() {
        return RUNTIME_CONTEXTS.pop();
    }
};

export function runInContext( context, callback ) {
    const contexts = Array.isArray( context ) ? context : [ context ];
    runtime.push.apply( runtime, contexts );

    const result = callback();

    let i = contexts.length;
    while ( i-- ) {
        runtime.pop();
    }

    return result;
}

function modifyPrototypeChainForContext() {
    const reserved = [
        'constructor'
    ];

    let prototype = Object.getPrototypeOf( this );
    while ( prototype !== Object.prototype ) {
        const contexts = [ this, prototype.constructor ];
        const meta = METADATA.get( prototype );
        Object.getOwnPropertyNames( prototype ).forEach( propName => {
            if ( -1 !== reserved.indexOf( propName ) ) {
                return;
            }
            if ( -1 !== meta.protected.indexOf( propName ) ) {
                return;
            }
            if ( -1 !== meta.private.indexOf( propName ) ) {
                return;
            }
            const descriptor = Object.getOwnPropertyDescriptor( prototype, propName );
            Object.defineProperty( prototype, propName, {
                value() {
                    const args = arguments;
                    return runInContext(
                        contexts,
                        () => descriptor.value.apply( this, args )
                    )
                }
            } )
        } );
        prototype = Object.getPrototypeOf( prototype );
    }
}

export function injectContext( target ) {
    return class extends target {
        constructor() {
            super( ...arguments );
            modifyPrototypeChainForContext.call( this );
        }
    };
}

export function _protected( target, name, descriptor ) {
    METADATA.get( target ).protected.push( name );

    const originalValue = descriptor.value;
    descriptor.value = function() {
        if ( !runtime.hasInstanceOf( target.constructor ) ) {
            throw new Error( `${target.constructor.name}.${name} is protected!` );
        }
        const args = arguments;
        return runInContext(
            [ target.constructor ],
            () => originalValue.apply( this, args )
        );
    };
    return descriptor;
}

export function _private( target, name, descriptor ) {
    METADATA.get( target ).private.push( name );

    const originalValue = descriptor.value;
    descriptor.value = function() {
        if ( !runtime.has( target.constructor ) ) {
            throw new Error( `${target.constructor.name}.${name} is private!` );
        }
        return originalValue.apply( this, arguments );
    };
    return descriptor;
}




