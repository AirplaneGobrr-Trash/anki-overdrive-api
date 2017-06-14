import {suite, test} from "mocha-typescript";
import {fail} from "assert";
import {expect} from "chai";
import {Track} from "../../../../main/de.msg.iot.anki/core/track/track-interface";
import {TrackImpl} from "../../../../main/de.msg.iot.anki/core/track/track-impl";
import {Straight} from "../../../../main/de.msg.iot.anki/core/track/straight";
import {Curve} from "../../../../main/de.msg.iot.anki/core/track/curve";
import {Piece} from "../../../../main/de.msg.iot.anki/core/track/piece-interface";
import {Start} from "../../../../main/de.msg.iot.anki/core/track/start";
import {Finish} from "../../../../main/de.msg.iot.anki/core/track/finish";

@suite
class TrackTest {

    @test
    findPieces() {
        let track: Track = TrackImpl.build([
            new Straight(10),
            new Straight(10),
            new Straight(10),
            new Straight(11)
        ]);

        expect(track.findPieces(10).length).to.equals(3);
        expect(track.findPieces(11).length).to.equals(1);
        expect(track.findPieces(0).length).to.equals(0);

        track.findPieces(10).forEach((piece) => {
            expect(piece.id).to.equals(10);
        });
    }

    @test
    findPiece() {
        let track: Track = TrackImpl.build([
            new Straight(10),
            new Straight(10),
            new Straight(10),
            new Straight(11)
        ]);

        expect(track.findPiece(10).id).to.equals(10);
        expect(track.findPiece(11).id).to.equals(11);
        try {
            let piece = track.findPiece(0);
            fail(piece, null, "Should not be found.", "function");
        } catch (e) {
            expect(e).not.to.be.null;
        }
    }

    @test
    eachPiece() {
        let pieces: Array<Piece> = [
                new Curve(0),
                new Curve(1),
                new Straight(2),
                new Curve(3),
                new Curve(4)
            ],
            track: Track = TrackImpl.build(pieces),
            i = 0;

        pieces.splice(0, 0, new Start());
        pieces.splice(pieces.length, 0, new Finish());

        track.eachPiece(piece => {
            expect(piece.id).to.be.equals(pieces[i++].id);
        });
    }

    @test
    eachLaneOnPiece() {
        let pieces: Array<Piece> = [
                new Curve(0),
                new Curve(1),
                new Straight(2),
                new Curve(3),
                new Curve(4)
            ],
            track: Track = TrackImpl.build(pieces),
            i = 0,
            j = 0;

        pieces.splice(0, 0, new Start());
        pieces.push(new Finish());

        track.eachLaneOnPiece((piece, lane) => {
            let expectedPiece = pieces[i],
                expectedLane = expectedPiece.getLane(j);

            expect(piece.id).to.be.equal(expectedPiece.id);
            expect(lane.length).to.equals(expectedLane.length);
            for (let k = 0; k < lane.length; ++k)
                expect(lane[k]).to.equals(expectedLane[k]);

            if (i === pieces.length - 1) {
                i = 0;
                ++j;
            } else
                ++i;
        });
    }

    @test
    eachTransition() {
        let track = TrackImpl.build([
                new Straight(1),
                new Curve(2)
            ]),
            i = 0,
            validationData: Array<[[number, number], [number, number]]> = [
                [[33, 0], [1, 0]],
                [[1, 0], [1, 1]],
                [[1, 1], [1, 2]],
                [[1, 2], [2, 0]],
                [[2, 0], [2, 1]],
                [[2, 1], [34, 0]],
                [[34, 0], [34, 1]],
                [[34, 1], [33, 0]]
            ];

        track.eachTransition((t1, t2) => {
            expect(t1[0]).to.be.equals(validationData[i][0][0]);
            expect(t1[1]).to.be.equals(validationData[i][0][1]);
            expect(t2[0]).to.be.equals(validationData[i][1][0]);
            expect(t2[1]).to.be.equals(validationData[i][1][1]);
            i++;
        }, 0, [17, 0], [17, 0]);
    }

    @test
    findLane() {
        let track: Track = TrackImpl.build([
            new Curve(0),
            new Curve(1),
            new Straight(2),
            new Curve(3),
            new Curve(4)
        ]);

        expect(track.findLane(0, 0)).to.be.equals(0);
        expect(track.findLane(0, 36)).to.be.equals(15);
        expect(track.findLane(2, 2)).to.be.equals(0);
        expect(track.findLane(2, 24)).to.be.equals(8);
        expect(track.findLane(2, 45)).to.be.equals(15);

        for (let i = 0; i < 16; ++i)
            expect(track.findLane(Start._ID, i)).to.be.equals(i);
    }

    @test
    build() {
        let pieces: Array<Piece> = [
                new Curve(0),
                new Curve(1),
                new Straight(2),
                new Curve(3),
                new Curve(4)
            ],
            track: Track = TrackImpl.build(pieces),
            current: Piece = track.start.next,
            i = 0;

        while (current !== track.finish) {
            expect(current).to.be.equal(pieces[i++]);
            current = current.next;
        }
    }

}