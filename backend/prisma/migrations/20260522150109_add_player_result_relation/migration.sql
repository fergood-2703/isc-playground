-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
