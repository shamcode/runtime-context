describe( 'Classic OOP', () => {

    it( 'implement abstract method', () => {
        class Man {
            drink() {
                throw new Error( 'Man.drink() is abstract!' );
            }
        }

        class Worker extends Man {
            drink() {
                return 'Coffee';
            }
        }

        class BarClient extends Man {
            drink() {
                return 'Beer';
            }
        }

        const worker = new Worker();
        expect( worker.drink() ).toBe( 'Coffee' );

        const barClient = new BarClient();
        expect( barClient.drink() ).toBe( 'Beer' );
    } );
} );

describe( 'Context', () => {

    it( 'place context', () => {
        class Man {
            drinkCoffee() {
                return 'Coffee';
            }
            drinkBeer() {
                return 'Beer';
            }
        }

        class Place {
            constructor( man ) {
                this.man = man;
            }
            drink() {
                throw new Error( 'Place.drink() is abstract!' );
            }
        }

        class Work extends Place {
            drink() {
                return this.man.drinkCoffee();
            }
        }

        class Bar extends Place {
            drink() {
                return this.man.drinkBeer();
            }
        }

        const man = new Man();

        const work = new Work( man );
        expect( work.drink() ).toBe( 'Coffee' );

        const bar = new Bar( man );
        expect( bar.drink() ).toBe( 'Beer' );
    } );
} );